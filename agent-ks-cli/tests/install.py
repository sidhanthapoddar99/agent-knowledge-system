"""Exercise installer success/failure using a local GitHub-release fixture."""
import hashlib
import io
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import tarfile
import tempfile
import tomllib

crate = Path(__file__).resolve().parents[1]
version = tomllib.loads((crate / 'Cargo.toml').read_text())['package']['version']
candidates = [crate / 'releases/release/agent-ks', *crate.glob('releases/*/release/agent-ks')]
binary = next(p for p in candidates if p.is_file())
arch = 'aarch64' if platform.machine() in ('aarch64', 'arm64') else 'x86_64'
asset = f'agent-ks-{arch}-unknown-linux-musl.tar.gz'
with tempfile.TemporaryDirectory() as td:
    root = Path(td)
    fixture = root / 'fixture'
    fixture.mkdir()
    archive = fixture / asset
    with tarfile.open(archive, 'w:gz') as tar:
        tar.add(binary, arcname='agent-ks')
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    (fixture / 'SHA256SUMS').write_text(f'{digest}  {asset}\n')
    commit = 'a' * 40
    tag_object = 'b' * 40
    (fixture / 'alias-ref.json').write_text(json.dumps({
        'ref': 'refs/tags/cli-latest',
        'object': {'type': 'commit', 'sha': commit},
    }, indent=2))
    (fixture / 'Cargo.toml').write_text(f'[package]\nname = "agent-ks"\nversion = "{version}"\n')
    (fixture / 'numbered-release.json').write_text(json.dumps({
        'tag_name': f'agent-ks-cli-v{version}',
        'draft': False,
        'prerelease': False,
        'published_at': '2026-09-06T00:00:00Z',
        'assets': [
            {'name': asset, 'state': 'uploaded', 'size': archive.stat().st_size},
            {'name': 'SHA256SUMS', 'state': 'uploaded', 'size': 80},
        ],
    }, indent=2))
    (fixture / 'numbered-ref.json').write_text(json.dumps({
        'ref': f'refs/tags/agent-ks-cli-v{version}',
        'object': {'type': 'tag', 'sha': tag_object},
    }, indent=2))
    (fixture / 'tag-object.json').write_text(json.dumps({
        'object': {'type': 'commit', 'sha': commit},
    }, indent=2))
    (fixture / 'releases.json').write_text(json.dumps([
        {'tag_name': 'agent-ks-engine-v99.0.0'},
        {'tag_name': 'agent-ks-plugin-v99.0.0'},
        {'tag_name': 'agent-ks-cli-v9.9.9-beta.1'},
        {'tag_name': f'agent-ks-cli-v{version}', 'published_at': '2026-09-06T00:00:00Z'},
    ], indent=2))
    mock = root / 'mock'
    mock.mkdir()
    curl = mock / 'curl'
    curl.write_text('''#!/usr/bin/env python3
import os, sys, shutil
from pathlib import Path
args=sys.argv[1:]
url=next(a for a in args if a.startswith('https://'))
fixture=Path(os.environ['INSTALL_FIXTURE'])
with Path(os.environ['INSTALL_LOG']).open('a') as log:
    log.write(url+'\\n')
if url.endswith('/git/ref/tags/cli-latest'):
    if os.environ.get('INSTALL_ALIAS_MODE') == 'missing':
        raise SystemExit(22)
    name='alias-ref.json'
elif 'raw.githubusercontent.com' in url:
    name='Cargo.toml'
elif '/releases/tags/agent-ks-cli-v' in url:
    name='numbered-release.json'
elif '/git/ref/tags/agent-ks-cli-v' in url:
    name='numbered-ref.json'
elif '/git/tags/' in url:
    name='tag-object.json'
elif '/releases?per_page=' in url:
    name='releases.json'
elif '/releases/download/agent-ks-cli-v' in url:
    name=url.rsplit('/',1)[-1]
else:
    raise SystemExit(f'unexpected release namespace: {url}')
shutil.copyfile(fixture/name,args[args.index('-o')+1])
''')
    curl.chmod(0o755)
    log = root / 'urls.log'
    env = dict(
        os.environ,
        PATH=str(mock) + os.pathsep + os.environ['PATH'],
        INSTALL_FIXTURE=str(fixture),
        INSTALL_LOG=str(log),
    )
    env.pop('AGENTKS_VERSION', None)
    env.update(HOME=str(root/'home'), SHELL='/bin/bash', AGENTKS_UPDATE_DIR=str(root/'update-state'))
    env.pop('AGENTKS_AUTO_UPDATE', None)
    dest = root / 'bin with spaces'
    def run(*extra):
        return subprocess.run(['sh', str(crate/'install.sh'), '--install-dir', str(dest), *extra], env=env, capture_output=True, text=True)
    result = run()
    assert result.returncode == 0, result.stderr
    urls = log.read_text()
    assert '/git/ref/tags/cli-latest' in urls
    assert f'/{commit}/agent-ks-cli/Cargo.toml' in urls
    assert f'/releases/tags/agent-ks-cli-v{version}' in urls
    assert '/releases?per_page=' not in urls
    installed = dest/'agent-ks'
    assert installed.read_bytes() == binary.read_bytes()
    profile = root/'home/.bashrc'
    assert 'update --background' in profile.read_text()
    assert profile.read_text().count('# >>> agent-ks >>>') == 1
    before_profile=profile.read_text()
    assert run().returncode == 0
    assert profile.read_text() == before_profile
    assert run('--version', version).returncode == 0
    settings=json.loads((root/'update-state/settings.json').read_text())
    assert settings['pin'] == version
    assert run().returncode == 0
    assert json.loads((root/'update-state/settings.json').read_text())['pin'] is None
    log.write_text('')
    env['INSTALL_ALIAS_MODE'] = 'missing'
    result = run('--no-shell-setup')
    assert result.returncode == 0, result.stderr
    assert '/releases?per_page=' in log.read_text()
    env.pop('INSTALL_ALIAS_MODE')
    (fixture / 'Cargo.toml').write_text('[package]\nname = "agent-ks"\nversion = "0.1.1"\n')
    stale_release = json.loads((fixture / 'numbered-release.json').read_text())
    stale_release['tag_name'] = 'agent-ks-cli-v0.1.1'
    (fixture / 'numbered-release.json').write_text(json.dumps(stale_release, indent=2))
    stale_ref = json.loads((fixture / 'numbered-ref.json').read_text())
    stale_ref['ref'] = 'refs/tags/agent-ks-cli-v0.1.1'
    (fixture / 'numbered-ref.json').write_text(json.dumps(stale_ref, indent=2))
    log.write_text('')
    result = run('--no-shell-setup')
    assert result.returncode == 0, result.stderr
    assert '/releases?per_page=' in log.read_text()
    (fixture / 'Cargo.toml').write_text(f'[package]\nname = "agent-ks"\nversion = "{version}"\n')
    stale_release['tag_name'] = f'agent-ks-cli-v{version}'
    (fixture / 'numbered-release.json').write_text(json.dumps(stale_release, indent=2))
    stale_ref['ref'] = f'refs/tags/agent-ks-cli-v{version}'
    (fixture / 'numbered-ref.json').write_text(json.dumps(stale_ref, indent=2))
    before_profile=profile.read_text()
    assert run('--no-shell-setup').returncode == 0
    assert profile.read_text() == before_profile
    profile.write_text('export PRESERVE_ME=yes\n'+profile.read_text())
    assert run().returncode == 0
    assert profile.read_text().startswith('export PRESERVE_ME=yes\n')
    previous = installed.read_bytes()
    (fixture/'SHA256SUMS').write_text(f'{"0"*64}  {asset}\n')
    log.write_text('')
    result = run('--no-shell-setup')
    assert result.returncode == 1 and 'Checksum mismatch' in result.stderr
    assert '/releases?per_page=' not in log.read_text()
    assert installed.read_bytes() == previous
    assert run('--version', 'bad; echo unsafe').returncode == 1
    assert run('--unknown').returncode == 2
    assert run('--version').returncode == 2
    with tarfile.open(archive, 'w:gz') as tar:
        info = tarfile.TarInfo('../escape')
        data = b'bad'
        info.size = len(data)
        tar.addfile(info, io.BytesIO(data))
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    (fixture/'SHA256SUMS').write_text(f'{digest}  {asset}\n')
    result = run('--version', version)
    assert result.returncode == 1 and 'Unexpected archive' in result.stderr
    assert installed.read_bytes() == previous
print('Installer: latest CLI selection, explicit version/pins, idempotent shell setup, spaces, checksum failure, invalid arguments, and archive traversal checks passed.')

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
    (fixture / 'releases.json').write_text(json.dumps([
        {'tag_name': 'v99.0.0'}, {'tag_name': 'agent-ks-v9.9.9-beta.1'},
        {'tag_name': f'agent-ks-v{version}'},
    ], indent=2))
    mock = root / 'mock'
    mock.mkdir()
    curl = mock / 'curl'
    curl.write_text('''#!/usr/bin/env python3
import os, sys, shutil
from pathlib import Path
args=sys.argv[1:]
url=next(a for a in args if a.startswith('https://'))
name='releases.json' if 'api.github.com' in url else url.rsplit('/',1)[-1]
shutil.copyfile(Path(os.environ['INSTALL_FIXTURE'])/name,args[args.index('-o')+1])
''')
    curl.chmod(0o755)
    env = dict(os.environ, PATH=str(mock) + os.pathsep + os.environ['PATH'], INSTALL_FIXTURE=str(fixture))
    env.pop('AGENTKS_VERSION', None)
    env.update(HOME=str(root/'home'), SHELL='/bin/bash', AGENTKS_UPDATE_DIR=str(root/'update-state'))
    env.pop('AGENTKS_AUTO_UPDATE', None)
    dest = root / 'bin with spaces'
    def run(*extra):
        return subprocess.run(['sh', str(crate/'install.sh'), '--install-dir', str(dest), *extra], env=env, capture_output=True, text=True)
    result = run()
    assert result.returncode == 0, result.stderr
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
    before_profile=profile.read_text()
    assert run('--no-shell-setup').returncode == 0
    assert profile.read_text() == before_profile
    profile.write_text('export PRESERVE_ME=yes\n'+profile.read_text())
    assert run().returncode == 0
    assert profile.read_text().startswith('export PRESERVE_ME=yes\n')
    previous = installed.read_bytes()
    (fixture/'SHA256SUMS').write_text(f'{"0"*64}  {asset}\n')
    result = run('--version', version)
    assert result.returncode == 1 and 'Checksum mismatch' in result.stderr
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

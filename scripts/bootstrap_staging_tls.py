#!/usr/bin/env python3
"""
MyArea24 — Staging TLS Certificate Bootstrapper
Solves the "chicken-and-egg" certificate initialization problem:
Nginx refuses to start if SSL certificates do not exist, but Certbot requires
Nginx to be running to solve the ACME HTTP-01 challenge.

This utility creates temporary self-signed certificates in the target Let's Encrypt
directory if real certificates do not yet exist, allowing Nginx to boot up cleanly.
Once Nginx is live, Certbot can obtain the genuine Let's Encrypt certificates.
"""

import argparse
import os
import subprocess
import sys


def ensure_staging_certificates(
    cert_dir: str = "deploy/certs/live/staging.myarea24.in",
    domain: str = "staging.myarea24.in",
) -> bool:
    """
    Checks if SSL certificate exists; if missing, generates a self-signed fallback.
    """
    os.makedirs(cert_dir, exist_ok=True)
    fullchain_path = os.path.join(cert_dir, "fullchain.pem")
    privkey_path = os.path.join(cert_dir, "privkey.pem")

    if os.path.exists(fullchain_path) and os.path.exists(privkey_path):
        print(f"[✓] Existing SSL certificates found at {cert_dir}.")
        return True

    print(f"[*] No TLS certificates found in {cert_dir}.")
    print(f"[*] Generating temporary self-signed bootstrap certificate for {domain}...")

    # Generate private key and certificate using openssl
    openssl_cmd = [
        "openssl",
        "req",
        "-x509",
        "-nodes",
        "-newkey",
        "rsa:2048",
        "-days",
        "30",
        "-keyout",
        privkey_path,
        "-out",
        fullchain_path,
        "-subj",
        f"/CN={domain}/O=MyArea24 Bootstrap",
    ]

    try:
        subprocess.run(openssl_cmd, check=True, capture_output=True, text=True)
        print(f"[+] Bootstrap self-signed certificate generated successfully:")
        print(f"    - Certificate: {fullchain_path}")
        print(f"    - Private Key: {privkey_path}")
        print("[+] Nginx can now start safely and respond to Certbot ACME HTTP-01 challenges.")
        return True
    except FileNotFoundError:
        # Fallback: Generate self-signed cert using Python cryptography library if openssl CLI is unavailable
        try:
            import datetime
            from cryptography import x509
            from cryptography.x509.oid import NameOID
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.hazmat.primitives.asymmetric import rsa

            key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
            subject = issuer = x509.Name([
                x509.NameAttribute(NameOID.COMMON_NAME, domain),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, "MyArea24 Bootstrap"),
            ])
            cert = (
                x509.CertificateBuilder()
                .subject_name(subject)
                .issuer_name(issuer)
                .public_key(key.public_key())
                .serial_number(x509.random_serial_number())
                .not_valid_before(datetime.datetime.now(datetime.timezone.utc))
                .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30))
                .add_extension(x509.SubjectAlternativeName([x509.DNSName(domain)]), critical=False)
                .sign(key, hashes.SHA256())
            )

            with open(privkey_path, "wb") as f:
                f.write(key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption(),
                ))

            with open(fullchain_path, "wb") as f:
                f.write(cert.public_bytes(serialization.Encoding.PEM))

            print(f"[+] Bootstrap certificate generated via Python cryptography:")
            print(f"    - Certificate: {fullchain_path}")
            print(f"    - Private Key: {privkey_path}")
            return True
        except Exception as py_err:
            print(f"[-] Could not generate self-signed cert: {py_err}", file=sys.stderr)
            return False
    except subprocess.CalledProcessError as cmd_err:
        print(f"[-] OpenSSL command failed: {cmd_err.stderr}", file=sys.stderr)
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MyArea24 Staging TLS Bootstrapper")
    parser.add_argument("--cert-dir", default="deploy/certs/live/staging.myarea24.in")
    parser.add_argument("--domain", default="staging.myarea24.in")
    args = parser.parse_args()

    success = ensure_staging_certificates(args.cert_dir, args.domain)
    sys.exit(0 if success else 1)

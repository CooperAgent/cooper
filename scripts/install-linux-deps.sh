#!/bin/bash
# Install Linux dependencies for Cooper
# Auto-detects distro and installs appropriate packages
# Run with: sudo ./scripts/install-linux-deps.sh

set -e

# Detect package manager / distro
if command -v apt-get &> /dev/null; then
    echo "Detected Debian/Ubuntu - using apt..."
    apt-get update
    # Try t64 variant first (Ubuntu 24.04+), fall back to old name
    if apt-get install -y libnss3 libasound2t64 2>/dev/null; then
        echo "Installed libasound2t64 (Ubuntu 24.04+)"
    else
        apt-get install -y libnss3 libasound2
        echo "Installed libasound2 (older Ubuntu)"
    fi
elif command -v dnf &> /dev/null; then
    echo "Detected Fedora/RHEL - using dnf..."
    dnf install -y nss alsa-lib
elif command -v pacman &> /dev/null; then
    echo "Detected Arch Linux - using pacman..."
    pacman -S --noconfirm nss alsa-lib
elif command -v zypper &> /dev/null; then
    echo "Detected openSUSE - using zypper..."
    zypper install -y mozilla-nss alsa-lib
else
    echo "Unknown distro. Please install manually:"
    echo "  - NSS (Network Security Services)"
    echo "  - ALSA lib (audio support)"
    exit 1
fi

echo ""
echo "Done! Electron dependencies installed."
echo "Verify with: ldd node_modules/electron/dist/electron | grep 'not found'"

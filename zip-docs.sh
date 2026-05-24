#!/bin/bash
# ============================================================
# zip-docs.sh — Villa Paradise Tahiti
# Compresse la documentation pour partage avec Claude Code
# ============================================================

# Nom du fichier zip de sortie
ZIP_NAME="villa-paradise-tahiti-docs.zip"

# Répertoire courant
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌺 Villa Paradise Tahiti — Création du zip de documentation"
echo "============================================================"
echo ""

# Supprimer le zip précédent s'il existe
if [ -f "$SCRIPT_DIR/$ZIP_NAME" ]; then
    echo "🗑️  Suppression de l'ancien zip..."
    rm "$SCRIPT_DIR/$ZIP_NAME"
fi

# Créer le zip avec README + dossier docs
echo "📦 Compression en cours..."
cd "$SCRIPT_DIR"

zip -r "$ZIP_NAME" \
    README.md \
    docs/ \
    --exclude "*.DS_Store" \
    --exclude "*Thumbs.db" \
    --exclude "*.tmp"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Zip créé avec succès : $ZIP_NAME"
    echo ""
    echo "📋 Contenu du zip :"
    unzip -l "$ZIP_NAME"
    echo ""
    echo "📁 Taille : $(du -sh "$ZIP_NAME" | cut -f1)"
    echo ""
    echo "🚀 Prêt à partager avec Claude Code !"
    echo ""
    echo "Étape suivante :"
    echo "  Donnez ce zip à Claude Code avec le prompt :"
    echo "  'Lis ce zip de documentation et recommande-moi"
    echo "   3 à 5 frameworks adaptés à mon projet.'"
else
    echo ""
    echo "❌ Erreur lors de la création du zip."
    exit 1
fi

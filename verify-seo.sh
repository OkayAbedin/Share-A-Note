#!/bin/bash

# SEO Verification Script for Share-A-Note
echo "🔍 SEO Setup Verification"
echo "========================="

# Check if sitemap file exists
echo "✅ Checking sitemap.ts..."
if [ -f "src/app/sitemap.ts" ]; then
    echo "   ✓ Sitemap generator found"
else
    echo "   ✗ Sitemap generator missing"
fi

# Check if robots.ts exists
echo "✅ Checking robots.ts..."
if [ -f "src/app/robots.ts" ]; then
    echo "   ✓ Robots.txt generator found"
else
    echo "   ✗ Robots.txt generator missing"
fi

# Check essential pages
echo "✅ Checking essential pages..."
pages=("src/app/page.tsx" "src/app/about/page.tsx" "src/app/privacy/page.tsx" "src/app/terms/page.tsx")
for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "   ✓ $(basename $(dirname $page))/$(basename $page) exists"
    else
        echo "   ✗ $page missing"
    fi
done

# Check StructuredData component
echo "✅ Checking structured data..."
if [ -f "src/components/StructuredData.tsx" ]; then
    echo "   ✓ Structured data component found"
else
    echo "   ✗ Structured data component missing"
fi

# Check meta tags in layout
echo "✅ Checking layout metadata..."
if grep -q "metadataBase" "src/app/layout.tsx"; then
    echo "   ✓ MetadataBase configured"
else
    echo "   ✗ MetadataBase missing"
fi

if grep -q "openGraph" "src/app/layout.tsx"; then
    echo "   ✓ OpenGraph tags configured"
else
    echo "   ✗ OpenGraph tags missing"
fi

# Check build files (if they exist)
echo "✅ Checking build output..."
if [ -d ".next" ]; then
    echo "   ✓ Build directory exists"
    
    # Check if sitemap is generated
    if [ -f ".next/server/app/sitemap.xml/route.js" ] || [ -f ".next/server/pages/sitemap.xml.js" ]; then
        echo "   ✓ Sitemap route generated"
    else
        echo "   ⚠ Sitemap route not found (run 'npm run build' first)"
    fi
    
    if [ -f ".next/server/app/robots.txt/route.js" ] || [ -f ".next/server/pages/robots.txt.js" ]; then
        echo "   ✓ Robots.txt route generated"
    else
        echo "   ⚠ Robots.txt route not found (run 'npm run build' first)"
    fi
else
    echo "   ⚠ No build directory found (run 'npm run build' first)"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Deploy your application to production"
echo "2. Set NEXT_PUBLIC_BASE_URL environment variable"
echo "3. Follow the GOOGLE_SEARCH_SETUP.md guide"
echo "4. Monitor using SEO_CHECKLIST.md"
echo ""
echo "📋 Quick Commands:"
echo "   npm run build    - Build for production"
echo "   npm run start    - Start production server"
echo "   npm run dev      - Start development server"

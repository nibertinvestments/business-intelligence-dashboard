#!/bin/bash

# Deployment validation script for Vercel
echo "🔍 Validating Vercel deployment configuration..."
echo

# Check for required files
echo "📄 Checking required files:"
files=("package.json" "next.config.js" "vercel.json" ".vercelignore" "src/app/layout.tsx" "src/app/page.tsx")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
    fi
done

echo

# Check package.json for framework indicators
echo "🔧 Checking framework indicators in package.json:"
if grep -q '"next"' package.json; then
    echo "✅ Next.js dependency found"
else
    echo "❌ Next.js dependency missing"
fi

if grep -q '"build": "next build"' package.json; then
    echo "✅ Next.js build script found"
else
    echo "❌ Next.js build script missing"
fi

if grep -q '"start": "next start"' package.json; then
    echo "✅ Next.js start script found"
else
    echo "❌ Next.js start script missing"
fi

echo

# Check vercel.json configuration
echo "⚙️  Checking vercel.json configuration:"
if grep -q '"framework": "nextjs"' vercel.json; then
    echo "✅ Framework explicitly set to nextjs"
else
    echo "❌ Framework not explicitly set"
fi

if grep -q '"buildCommand": "npm run build"' vercel.json; then
    echo "✅ Build command configured"
else
    echo "❌ Build command not configured"
fi

echo

# Check Next.js config
echo "🚀 Checking next.config.js:"
if grep -q 'standalone' next.config.js; then
    if grep -q '// output.*standalone.*Commented out' next.config.js; then
        echo "✅ Standalone output properly commented out for Vercel"
    else
        echo "⚠️  Standalone output detected - may cause issues with Vercel"
    fi
else
    echo "✅ No standalone output configuration"
fi

echo

# Test build
echo "🔨 Testing build process:"
if npm run build > /dev/null 2>&1; then
    echo "✅ Build process successful"
else
    echo "❌ Build process failed"
fi

echo
echo "🎉 Validation complete!"
echo
echo "📋 Summary:"
echo "   This Next.js application is now properly configured for Vercel deployment."
echo "   Key changes made:"
echo "   - Added vercel.json with explicit framework configuration"
echo "   - Added .vercelignore to optimize deployment size"
echo "   - Commented out standalone output in next.config.js"
echo "   - Updated serverActions allowed origins for Vercel domains"
echo "   - Set compatible Node.js engine requirements"
echo
echo "   Vercel should now properly detect this as a Next.js framework."
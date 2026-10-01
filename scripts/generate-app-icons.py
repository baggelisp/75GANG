# Renders every app-icon, splash and store asset from the vector logo.
#
#   pip install pillow resvg-py
#   python3 scripts/generate-app-icons.py
#
# assets/logo/logo.svg is the source of truth. It was traced from the original raster logo, so it
# stays sharp at any size; every PNG under assets/images and assets/store is generated from it.
import io

import resvg_py
from PIL import Image

LOGO = open('assets/logo/logo.svg', encoding='utf8').read()

# The app ground (`bg` in src/theme/tokens.ts).
BACKGROUND = (0x1A, 0x19, 0x1C)

ICON_SIZE = 1024
# iOS rounds the corners of the full square, so the logo can fill most of it.
ICON_LOGO_HEIGHT = 0.84
# Android masks the foreground to a circle of 66% of the canvas; the logo's diagonal stays inside.
ANDROID_LOGO_HEIGHT = 0.5
SPLASH_HEIGHT = 1000
FAVICON_SIZE = 48
PLAY_ICON_SIZE = 512
FEATURE_GRAPHIC = (1024, 500)
FEATURE_LOGO_HEIGHT = 0.86


def render_logo(height):
    png = resvg_py.svg_to_bytes(svg_string=LOGO, height=height)
    return Image.open(io.BytesIO(bytes(png))).convert('RGBA')


def compose(size, logo_height, background):
    width, height = size
    canvas = Image.new('RGBA', size, background + (255,) if background else (0, 0, 0, 0))
    logo = render_logo(round(height * logo_height))
    canvas.alpha_composite(logo, ((width - logo.width) // 2, (height - logo.height) // 2))
    return canvas


def save_opaque(image, path):
    image.convert('RGB').save(path, optimize=True)


square = (ICON_SIZE, ICON_SIZE)

# iOS and the Expo default: opaque, because App Store Connect rejects an icon with alpha.
save_opaque(compose(square, ICON_LOGO_HEIGHT, BACKGROUND), 'assets/images/icon.png')

# Android adaptive icon: a transparent foreground over a flat background layer.
compose(square, ANDROID_LOGO_HEIGHT, None).save('assets/images/android-icon-foreground.png', optimize=True)
compose(square, ANDROID_LOGO_HEIGHT, None).save('assets/images/android-icon-monochrome.png', optimize=True)
save_opaque(Image.new('RGBA', square, BACKGROUND + (255,)), 'assets/images/android-icon-background.png')

# Splash: the logo alone on transparency; app.json paints the ground behind it.
render_logo(SPLASH_HEIGHT).save('assets/images/splash-icon.png', optimize=True)

save_opaque(
    compose(square, ICON_LOGO_HEIGHT, BACKGROUND).resize((FAVICON_SIZE, FAVICON_SIZE), Image.LANCZOS),
    'assets/images/favicon.png',
)

# Store listings. App Store Connect takes its icon from the build; Google Play wants these two.
save_opaque(
    compose(square, ICON_LOGO_HEIGHT, BACKGROUND).resize((PLAY_ICON_SIZE, PLAY_ICON_SIZE), Image.LANCZOS),
    'assets/store/play-store-icon-512.png',
)
save_opaque(compose(FEATURE_GRAPHIC, FEATURE_LOGO_HEIGHT, BACKGROUND), 'assets/store/play-feature-graphic-1024x500.png')

print('generated app icons, splash, favicon and store assets')

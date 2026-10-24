/**
 * Cross-product color group swatches.
 *
 * The swatches themselves are rendered server side (see
 * `snippets/color-group-swatches.liquid`). Each swatch links to the product
 * page of one colour, so every colour keeps its own URL, its own first image
 * and its own social/Pinterest landing page.
 *
 * This script adds two behaviours:
 * 1. The currently selected size is carried over to the target product
 *    (`?variant=` of the matching size on the target product).
 * 2. Hovering a swatch previews the first image of that colour in the main
 *    product media area.
 */

const SIZE_OPTION_NAME_PATTERN = /^(size|尺寸)[\s\-_–—]/i;
const SELECT_SIZE_DROPDOWN_PATTERN = /^options\[(size|尺寸)\]/i;

/**
 * Returns the size label the shopper currently selected, if any.
 * The search stays inside the given picker (or the whole document when no
 * picker is provided) so multi-product pages never carry a foreign size.
 * @param {Element|null} [picker] - The variant-picker element to scope to.
 * @returns {string|null}
 */
function getSelectedSize(picker) {
  const scope = picker || document;
  const checkedSelector = picker
    ? 'input[type="radio"]:checked'
    : 'variant-picker input[type="radio"]:checked, [data-mv-option-kind="size"] input[type="radio"]:checked';

  for (const control of scope.querySelectorAll(`${checkedSelector}, select`)) {
    const name = control.getAttribute('name') || '';
    const isSize =
      control instanceof HTMLSelectElement
        ? SELECT_SIZE_DROPDOWN_PATTERN.test(name)
        : SIZE_OPTION_NAME_PATTERN.test(name);
    if (!isSize) continue;

    const value = (control.value || '').trim();
    // "Custom Sizes" placeholders are not real sizes.
    if (value && !/^custom sizes?$/i.test(value)) return value;
  }

  // Fallback: resolve the size from the `?variant=` parameter.
  const variantId = new URLSearchParams(window.location.search).get('variant');
  if (!variantId) return null;

  for (const radio of scope.querySelectorAll('input[type="radio"][data-variant-id]')) {
    if (radio.getAttribute('data-variant-id') !== variantId) continue;
    const name = radio.getAttribute('name') || '';
    if (!SIZE_OPTION_NAME_PATTERN.test(name)) continue;
    const value = (radio.value || '').trim();
    if (value) return value;
  }

  return null;
}

/**
 * Reads the size map rendered on the swatch link.
 * @param {HTMLElement} link - The swatch link.
 * @returns {Array<{size: string, variant: number}>}
 */
function getSizeMap(link) {
  try {
    const parsed = JSON.parse(link.getAttribute('data-sizes') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/**
 * Builds the target URL, carrying over the selected size when possible.
 * @param {HTMLElement} link - The swatch link.
 * @param {string|null} size - The selected size label.
 * @returns {string|null} The URL to navigate to, or null to use the default.
 */
function buildTargetUrl(link, size) {
  if (!size) return null;

  const sizeMap = getSizeMap(link);
  if (!sizeMap.length) return null;

  const normalizedSize = size.toLowerCase();
  const match = sizeMap.find((entry) => (entry.size || '').trim().toLowerCase() === normalizedSize);
  if (!match || !match.variant) return null;

  const url = new URL(link.getAttribute('href'), window.location.origin);
  url.searchParams.set('variant', String(match.variant));
  return url.toString();
}

/**
 * Returns the main product image, used for the hover preview.
 * @returns {HTMLImageElement|null}
 */
function getMainMediaImage() {
  return document.querySelector('.product-media img');
}

let previewedImage = null;
let previewRestoreState = null;
let activePreviewLink = null;

/**
 * Temporarily shows the first image of another colour.
 * @param {HTMLElement} link - The swatch link.
 */
function previewColorImage(link) {
  const previewSrc = link.getAttribute('data-preview-src');
  if (!previewSrc) return;

  const image = getMainMediaImage();
  if (!image) return;
  if (activePreviewLink === link) return;

  // Only the first hover saves the ORIGINAL image. Consecutive hovers over
  // different swatches must not overwrite the restore state with another
  // colour's preview URL.
  if (!previewRestoreState) {
    previewRestoreState = {
      image,
      src: image.getAttribute('src'),
      srcset: image.getAttribute('srcset'),
    };
  }

  image.removeAttribute('srcset');
  image.setAttribute('src', previewSrc);
  previewedImage = image;
  activePreviewLink = link;
}

/**
 * Restores the main product image after the hover preview.
 */
function restoreColorImage() {
  if (!previewRestoreState) return;

  const { image, src, srcset } = previewRestoreState;
  if (src) image.setAttribute('src', src);
  else image.removeAttribute('src');
  if (srcset) image.setAttribute('srcset', srcset);

  previewRestoreState = null;
  previewedImage = null;
  activePreviewLink = null;
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-color-group-link]');
  if (!link) return;

  const targetUrl = buildTargetUrl(link, getSelectedSize(link.closest('variant-picker')));
  if (!targetUrl) return;

  event.preventDefault();
  window.location.assign(targetUrl);
});

document.addEventListener('pointerover', (event) => {
  const link = event.target.closest('a[data-color-group-link]');
  if (!link) return;
  previewColorImage(link);
});

document.addEventListener('pointerout', (event) => {
  const link = event.target.closest('a[data-color-group-link]');
  if (!link || link !== activePreviewLink) return;
  // Stay in preview while the pointer is still inside the same swatch link
  // (e.g. moving between the image and the tooltip inside it).
  if (event.relatedTarget && link.contains(event.relatedTarget)) return;
  restoreColorImage();
});

window.addEventListener('pagehide', restoreColorImage);

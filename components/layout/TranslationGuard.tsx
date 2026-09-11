/**
 * Keeps the site alive under browser translation.
 *
 * Google Translate (Chrome's built-in one and the extension) rewrites the
 * page: it wraps each piece of text in its own `<font>` elements and moves
 * React's text nodes underneath. React does not know. The next time it needs
 * to remove or reorder one of those nodes, typically when a sentence switches
 * to another (the booking hint once a check-out date is picked), the DOM
 * throws "The node to be removed is not a child of this node" and the whole
 * page falls back to "Application error".
 *
 * This is the guard the React team points to (facebook/react#11538): when
 * the node React wants to touch is no longer where React left it, skip the
 * operation instead of throwing. The visible cost is a stale fragment of
 * translated text now and then; the alternative is a blank page.
 *
 * Must run before React hydrates: rendered as an inline script in the
 * document head by the root layout, in plain ES5 so it needs no bundling.
 */
const GUARD = `
(function () {
  if (typeof Node !== 'function' || !Node.prototype) return;
  var removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      return child;
    }
    return removeChild.apply(this, arguments);
  };
  var insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return insertBefore.apply(this, arguments);
  };
})();
`

export function TranslationGuard() {
  // The script is a constant written here, not user input.
  return <script id="translation-guard" dangerouslySetInnerHTML={{ __html: GUARD }} />
}

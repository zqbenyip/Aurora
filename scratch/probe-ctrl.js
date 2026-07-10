(function() {
    function p(msg) { console.log('[probe] ' + msg); }
    function keys(o, n) {
        try { return o ? Object.getOwnPropertyNames(o).slice(0, n || 25).join(',') : '(null)'; }
        catch (e) { return 'err:' + e; }
    }
    try {
        var ctor = customElements.get('ytd-two-column-search-results-renderer');
        p('ctor=' + !!ctor);
        var proto = ctor && ctor.prototype;
        var d = 0;
        while (proto && d < 8) {
            p('proto[' + d + '] own=' + keys(proto, 30));
            proto = Object.getPrototypeOf(proto);
            d++;
        }
        // Where does polymerController come from?
        var pr = ctor && ctor.prototype;
        var depth = 0;
        while (pr && depth < 8) {
            var desc = Object.getOwnPropertyDescriptor(pr, 'polymerController');
            if (desc) p('polymerController descriptor at depth ' + depth + ' get=' + (typeof desc.get) + ' value=' + (typeof desc.value));
            var descA = Object.getOwnPropertyDescriptor(pr, 'attached');
            if (descA) p('attached descriptor at depth ' + depth + ' get=' + (typeof descA.get) + ' value=' + (typeof descA.value));
            var descC = Object.getOwnPropertyDescriptor(pr, 'connectedCallback');
            if (descC) p('connectedCallback descriptor at depth ' + depth + ' get=' + (typeof descC.get) + ' value=' + (typeof descC.value));
            pr = Object.getPrototypeOf(pr);
            depth++;
        }
        // Fresh instance experiment: create, connect, drive controller by hand.
        var el = document.createElement('ytd-two-column-search-results-renderer');
        document.body.appendChild(el);
        var ctrl = el.polymerController;
        p('fresh ctrl=' + !!ctrl + ' ctrl.host=' + (ctrl && ctrl.host && ctrl.host.localName) +
          ' ctrl.hostElement=' + (ctrl && ctrl.hostElement && ctrl.hostElement.localName) +
          ' sameOnSecondAccess=' + (el.polymerController === ctrl));
        p('ctrl own keys=' + keys(ctrl, 30));
        p('ctrl proto own keys=' + keys(Object.getPrototypeOf(ctrl), 30));
        p('ctrl.__dataEnabled=' + (ctrl && ctrl.__dataEnabled) + ' ctrl.$=' + (ctrl && typeof ctrl.$));
        try {
            ctrl.ready();
            p('ctrl.ready() OK; el.shadowRoot=' + !!el.shadowRoot +
              ' ctrl.root=' + (ctrl.root ? (ctrl.root.nodeName + ' kids=' + ctrl.root.childNodes.length) : 'none') +
              ' el.kids=' + el.childNodes.length);
        } catch (e) {
            p('ctrl.ready() THREW ' + e + '\n' + (e && e.stack ? String(e.stack).split('\n').slice(0, 6).join('>') : ''));
        }
        try {
            ctrl.connectedCallback();
            p('ctrl.connectedCallback() OK; el.shadowRoot=' + !!el.shadowRoot +
              ' shadowKids=' + (el.shadowRoot ? el.shadowRoot.childNodes.length : 'n/a'));
        } catch (e) {
            p('ctrl.connectedCallback() THREW ' + e + '\n' + (e && e.stack ? String(e.stack).split('\n').slice(0, 6).join('>') : ''));
        }
    } catch (e) {
        p('ERR ' + e + '\n' + (e && e.stack));
    }
})();

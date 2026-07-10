(function() {
    function p(msg) { console.log('[probe] ' + msg); }
    function deepAll(name) {
        var out = [];
        (function walk(node) {
            if (!node) return;
            if (node.localName === name) out.push(node);
            if (node.shadowRoot) {
                var sk = node.shadowRoot.childNodes || [];
                for (var i = 0; i < sk.length; i++) walk(sk[i]);
            }
            var kids = node.childNodes || [];
            for (var j = 0; j < kids.length; j++) walk(kids[j]);
        })(document.documentElement);
        return out;
    }
    function ancestry(el) {
        var parts = [];
        var n = el;
        var hops = 0;
        while (n && hops++ < 25) {
            parts.push(n.localName || n.nodeName);
            var next = n.parentNode;
            if (!next && n.host) { parts.push('[shadow-of]'); next = n.host; }
            n = next;
        }
        return parts.join(' < ');
    }
    try {
        var vids = deepAll('ytd-video-renderer');
        p('video renderers=' + vids.length);
        for (var i = 0; i < Math.min(vids.length, 3); i++) {
            var v = vids[i];
            var c = v.polymerController || v;
            var d = c.data || (c.__data && c.__data.data);
            var title = '';
            try {
                title = d && d.title && d.title.runs ? d.title.runs.map(function(r) { return r.text; }).join('') :
                        (d && d.title && d.title.simpleText) || '(none)';
            } catch (e) { title = 'err'; }
            p('vid[' + i + '] isConnected=' + v.isConnected +
              ' ce_ready=' + !!v.__ce_ready__ +
              ' didCallReady=' + (c.didCallReady) +
              ' shadow=' + !!v.shadowRoot +
              ' shadowKids=' + (v.shadowRoot ? v.shadowRoot.childNodes.length : 0) +
              ' dataTitle=' + JSON.stringify(String(title).slice(0, 40)));
            p('vid[' + i + '] ancestry=' + ancestry(v));
        }
        // The item sections: are the videos inside their composed trees?
        var sections = deepAll('ytd-item-section-renderer');
        for (var s = 0; s < sections.length; s++) {
            var sec = sections[s];
            p('section[' + s + '] isConnected=' + sec.isConnected +
              ' kids=' + sec.childNodes.length +
              ' shadow=' + !!sec.shadowRoot +
              ' ancestry=' + ancestry(sec).slice(0, 120));
        }
        // Where does #contents of the section-list point?
        var slr = deepAll('ytd-section-list-renderer')[0];
        if (slr && slr.shadowRoot) {
            var contents = null;
            (function find(n2) {
                if (contents || !n2) return;
                if (n2.id === 'contents') { contents = n2; return; }
                var ks = n2.childNodes || [];
                for (var j2 = 0; j2 < ks.length; j2++) find(ks[j2]);
            })(slr.shadowRoot);
            p('slr #contents found=' + !!contents +
              ' kids=' + (contents ? contents.childNodes.length : 'n/a'));
            if (contents) {
                var names = [];
                for (var k3 = 0; k3 < contents.childNodes.length; k3++) {
                    names.push(contents.childNodes[k3].localName || contents.childNodes[k3].nodeName);
                }
                p('slr #contents kids=' + names.join(','));
            }
        }
    } catch (e) {
        p('ERR ' + e + '\n' + (e && e.stack));
    }
})();

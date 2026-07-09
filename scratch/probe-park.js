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
    function describeChain(el, hops) {
        var parts = [];
        var n = el;
        for (var i = 0; i < hops && n; i++) {
            var label = n.localName || n.nodeName;
            if (n.id) label += '#' + n.id;
            if (n.nodeType === 11) {
                label = '#frag(host=' + (n.host ? n.host.localName : 'none') +
                    ',owner=' + (n.__aurora_fragment_owner__ ? n.__aurora_fragment_owner__.localName : 'none') + ')';
            }
            parts.push(label);
            n = n.parentNode || n.host;
        }
        return parts.join(' < ');
    }
    try {
        var search = deepAll('ytd-search')[0];
        var vids = deepAll('ytd-video-renderer');
        var lockups = deepAll('yt-lockup-view-model');
        p('vids=' + vids.length + ' lockups=' + lockups.length);
        for (var i = 0; i < vids.length; i++) {
            var v = vids[i];
            var c = v.polymerController || v;
            p('vid[' + i + '] ready=' + (c.didCallReady === true) +
              ' shadow=' + !!v.shadowRoot +
              ' inSearchShadow=' + (v.parentNode === (search && search.shadowRoot)) +
              ' chain=' + describeChain(v, 5));
        }
        for (var l = 0; l < lockups.length; l++) {
            p('lockup[' + l + '] chain=' + describeChain(lockups[l], 4));
        }
        // item-sections' contents containers
        var sections = deepAll('ytd-item-section-renderer');
        for (var s = 0; s < sections.length; s++) {
            var sec = sections[s];
            var sc2 = sec.polymerController || sec;
            var contents = sc2.$ && sc2.$.contents;
            p('section[' + s + '] ready=' + (sc2.didCallReady === true) +
              ' $contents=' + !!contents +
              ' contentsKids=' + (contents ? contents.childNodes.length : 'n/a') +
              ' chain=' + describeChain(sec, 5));
        }
    } catch (e) {
        p('ERR ' + e + '\n' + (e && e.stack));
    }
})();

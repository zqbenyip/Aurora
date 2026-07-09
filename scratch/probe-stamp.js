(function() {
    function p(msg) { console.log('[probe] ' + msg); }
    function deepFirst(name) {
        var found = null;
        (function walk(node) {
            if (found || !node) return;
            if (node.localName === name) { found = node; return; }
            if (node.shadowRoot) {
                var sk = node.shadowRoot.childNodes || [];
                for (var i = 0; i < sk.length && !found; i++) walk(sk[i]);
            }
            var kids = node.childNodes || [];
            for (var j = 0; j < kids.length && !found; j++) walk(kids[j]);
        })(document.documentElement);
        return found;
    }
    try {
        var el = deepFirst('ytd-video-renderer');
        p('existing ytd-video-renderer=' + !!el);
        if (!el) return;
        var ctrl = el.polymerController || el;
        var t = null;
        try { t = ctrl._template; } catch (e) { p('_template threw ' + e); }
        p('template=' + !!t + ' content=' + !!(t && t.content) +
          ' cached _templateInfo=' + !!(t && t._templateInfo));
        if (!t) return;
        var info = null;
        try { info = ctrl.constructor._parseTemplate(t); } catch (e) { p('_parseTemplate threw ' + e); }
        p('templateInfo=' + !!info + ' nodeInfoList=' + (info && info.nodeInfoList ? info.nodeInfoList.length : 'n/a') +
          ' content=' + !!(info && info.content));
        if (!info || !info.content) return;
        var dom = null;
        try { dom = document.importNode(info.content, true); } catch (e) { p('importNode threw ' + e); }
        p('importNode dom=' + (dom ? dom.nodeName : String(dom)) +
          ' origKids=' + info.content.childNodes.length +
          ' cloneKids=' + (dom ? dom.childNodes.length : 'n/a'));
        if (!dom) return;
        // Polymer's findTemplateNode: ascend via parentInfo, select by parentIndex.
        function findTemplateNode(root, nodeInfo) {
            var parent = nodeInfo.parentInfo && findTemplateNode(root, nodeInfo.parentInfo);
            if (parent) {
                for (var n = parent.firstChild, i = 0; n; n = n.nextSibling) {
                    if (nodeInfo.parentIndex === i++) return n;
                }
                return undefined;
            }
            return root;
        }
        var nil = info.nodeInfoList;
        var fails = 0;
        for (var k = 0; k < nil.length; k++) {
            var found = findTemplateNode(dom, nil[k]);
            if (!found) {
                fails++;
                if (fails <= 5) {
                    var ni = nil[k];
                    var parent = ni.parentInfo && findTemplateNode(dom, ni.parentInfo);
                    p('nodeInfo[' + k + '] FAIL parentIndex=' + ni.parentIndex +
                      ' parentFound=' + !!parent +
                      ' parentKids=' + (parent ? parent.childNodes.length : 'n/a') +
                      ' parentName=' + (parent ? parent.nodeName : 'n/a'));
                    if (parent) {
                        var names = [];
                        for (var c = parent.firstChild; c; c = c.nextSibling) names.push(c.nodeName);
                        p('nodeInfo[' + k + '] parent clone kids=' + names.join(','));
                        // What does the ORIGINAL content have at that position?
                        var op = ni.parentInfo ? findTemplateNode(info.content, ni.parentInfo) : info.content;
                        if (op) {
                            var onames = [];
                            for (var oc = op.firstChild; oc; oc = oc.nextSibling) onames.push(oc.nodeName);
                            p('nodeInfo[' + k + '] parent orig kids=' + onames.join(','));
                        }
                    }
                }
            }
        }
        p('findTemplateNode failures=' + fails + '/' + nil.length);
    } catch (e) {
        p('ERR ' + e + '\n' + (e && e.stack));
    }
})();

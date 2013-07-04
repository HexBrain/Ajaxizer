/**
 * HexBrain
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to version 3 of the GPL license,
 * that is bundled with this package in the file LICENSE, and is
 * available online at http://www.gnu.org/licenses/gpl.txt
 *
 * @category    Hexbrain
 * @package     Hexbrain_Ajaxizer
 * @copyright   Copyright (c) 2013 HexBrain. (http://www.hexbrain.com)
 * @license     http://opensource.org/licenses/gpl-3.0.html  GNU General Public License, version 3 (GPL-3.0)
 */
"use strict";
var HB_Ajaxizer = Class.create();
HB_Ajaxizer.prototype = {
    initialize: function(settings) {
        this.body = $$('body')[0];
        this.settings = settings;
        this.leftSidebar = $$('.col-left')[0];
        this.content = $$('.col-main')[0];
        this.ajaxParam = 'useAjax=1';
        this.init();
    },

    init: function() {
        if (this.settings.layered != undefined && this.settings.layered != 0) {
            var navLinks = $$('.block-layered-nav a, .toolbar a');
            var navPicks = $$('.toolbar select');

            navLinks.each(function(link) {
                Event.observe(link, 'click', function(e) { this.clickAttr(e, link) }.bind(this));
            }.bind(this));
            navPicks.each(function(select) {
                select.writeAttribute('onchange', '');
                Event.observe(select, 'change', function(e) { this.selectAttr(e, select) }.bind(this));
            }.bind(this));
        }
        if (this.settings.scrolling != undefined && this.settings.scrolling != 0) {
            var Scroll = new HB_Scroll($$('.products-list, .products-grid:last')[0], this);
        }
    },

    clickAttr: function(event, link) {
        this.filterProducts(link.readAttribute('href'));
        Event.stop(event);
    },
    selectAttr: function(event, select) {
        this.filterProducts(select.value);
    },

    filterProducts: function(url) {
        this.body.addClassName('loading');
        new Ajax.Request(
            this.addAjaxToQuery(url), {
                onSuccess: function(response) {
                    this.leftSidebar.innerHTML = response.responseJSON.left;
                    this.content.innerHTML = response.responseJSON.content;
                    this.body.removeClassName('loading');
                    this.modifyURI(url);
                    this.init();
                }.bind(this)
            }
        );
    },

    modifyURI: function(url) {
        window.history.pushState({},"", url.replace(this.ajaxParam, ''));
    },

    addAjaxToQuery: function(url)
    {
        var query = url.split('?');
        if(query.length == 1) {
            url = url + '?' + this.ajaxParam;
        } else {
            url = url + '&' + this.ajaxParam;
        }
        return url;
    }
}

var HB_Scroll = Class.create();
HB_Scroll.prototype = {
    initialize: function(container, ajaxizer) {
        this.initContainer(container);
        this.ajaxizer = ajaxizer;
        this.state = false;
        $$('.pager').each(function(elem) {
            elem.hide();
        });
        var offset = Element.positionedOffset(this.container);
        var viewPort = document.viewport;
        Event.observe(window, 'scroll', function() {
            var cumulativeScrollOffset = viewPort.getScrollOffsets();
            if (cumulativeScrollOffset[1] + viewPort.getHeight() >= offset.top + this.container.getHeight()
                && !this.state) {
                this.state = true;
                var next = $$('.next');
                if (next.length > 0) {
                    this.doAjax(next[0].readAttribute('href'));
                }
            }
        }.bind(this));
    },
    initContainer: function(container) {
        this.container = container;
    },

    doAjax: function(url) {
        var loadDiv = document.createElement('div');
        loadDiv.innerHTML = '<div class="hb-loading">loading...</div>';
        $$('.toolbar-bottom')[0].insert({before: loadDiv.innerHTML});
        new Ajax.Request(
            url.replace(this.ajaxizer.ajaxParam, ''), {
                onSuccess: function(response) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response.responseText, "application/xhtml+xml");
                    $$('.hb-loading')[0].remove();
                    var productList = Prototype.Selector.select('.products-list', doc);
                    var productHtml = '';
                    if (productList.length <= 0) {
                        var productGrid = Prototype.Selector.select('.products-grid', doc);
                        productGrid.each(function(elem) {
                            elem.removeClassName('first');
                            productHtml += this.outerHTML(elem);
                        }.bind(this));
                        this.container.removeClassName('last');
                    } else {
                        productHtml += productList[0].innerHTML;
                    }
                    var pages = Prototype.Selector.select('.pages', doc);
                    if (this.container.readAttribute('class') != 'products-list') {
                        this.container.insert({after: productHtml});
                    } else {
                        this.container.innerHTML += productHtml;
                    }
                    $$('.pages').each(function(elem) {
                        elem.innerHTML = pages[0].innerHTML;
                    });
                    decorateGeneric($$('ul.products-grid'), ['odd','even','first','last']);
                    $$('body')[0].removeClassName('loading');
                    this.state = false;
                    this.initContainer($$('.products-list, .products-grid:last')[0]);
                }.bind(this)
            }
        );
    },
    outerHTML: function(node){
    return node.outerHTML || (
        function (n) {
            var div = document.createElement('div'), html;
            div.appendChild(n.cloneNode(true));
            html = div.innerHTML;
            div = null;
            return html;
        })(node);
    }
}
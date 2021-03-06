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
    initialize: function (settings) {
        this.settings = settings;
        this.init();
    },

    init: function () {
        //initialize elements that can be redefined if need
        this.body = $$('body')[0];
        this.leftSidebar = $$('.col-left')[0];
        this.cartSidebar = $$('.col-right .block-cart')[0];
        this.content = $$('.col-main')[0];
        this.topLinks = $$('.header ul.links')[0];
        this.gridSelector = '.products-list, .products-grid:last';
        this.gridContent = $$(this.gridSelector);
        this.toolbar = $$('.toolbar-bottom')[0];
        this.navLinks = $$('.block-layered-nav a, .toolbar a');
        this.navPicks = $$('.toolbar select');
        this.ajaxParam = 'useAjax=1';
        this.infobox = $$('.hb-popup')[0];
        this.infoboxContent = $$('.hb-popup .hb-content')[0];
        this.closeButton = $$('.hb-popup .hb-close')[0];

        if (this.settings.layered != undefined && this.settings.layered != 0) {
            this.navLinks.each(function (link) {
                Event.observe(link, 'click', function (e) {
                    this.clickAttr(e, link)
                }.bind(this));
            }.bind(this));
            this.navPicks.each(function (select) {
                select.writeAttribute('onchange', '');
                Event.observe(select, 'change', function (e) {
                    this.selectAttr(e, select)
                }.bind(this));
            }.bind(this));
        }
        if (this.settings.scrolling != undefined && this.settings.scrolling != 0 && this.gridContent.length > 0) {
            new HB_Scroll(this.gridContent[0], this);
        }
        if (this.settings.cart != undefined && this.settings.cart != 0) {
            var AjaxCart = new HB_AjaxCart(this);
            if (undefined != productAddToCartForm) {
                productAddToCartForm.submit = function (button, url) {
                    this.submit(button, url, productAddToCartForm);
                }.bind(AjaxCart);
                Event.observe(this.closeButton, 'click', function () {
                    this.closePopup()
                }.bind(this));
                Event.observe(document, 'keyup', function (e) {
                    if (e.keyCode == Event.KEY_ESC) {
                        this.closePopup();
                    }
                }.bind(this));
            }
        }
    },

    closePopup: function () {
        this.infobox.hide();
    },

    clickAttr: function (event, link) {
        this.filterProducts(link.readAttribute('href'));
        Event.stop(event);
    },
    selectAttr: function (event, select) {
        this.filterProducts(select.value);
    },

    filterProducts: function (url) {
        this.body.addClassName('loading');
        new Ajax.Request(
            this.addAjaxToQuery(url), {
                onSuccess: function (response) {
                    var json = response.responseText.evalJSON();
                    this.content.innerHTML = json.content;
                    this.leftSidebar.innerHTML = json.left;
                    this.body.removeClassName('loading');
                    this.modifyURI(url);
                    this.init();
                }.bind(this)
            }
        );
    },

    modifyURI: function (url) {
        window.history.pushState({}, "", url.replace(this.ajaxParam, ''));
    },

    addAjaxToQuery: function (url) {
        var query = url.split('?');
        if (query.length == 1) {
            url = url + '?' + this.ajaxParam;
        } else {
            url = url + '&' + this.ajaxParam;
        }
        return url;
    }
}

var HB_Scroll = Class.create();
HB_Scroll.prototype = {
    initialize: function (container, ajaxizer) {
        this.initContainer(container);
        this.ajaxizer = ajaxizer;
        this.state = false;
        $$('.pager').each(function (elem) {
            elem.hide();
        });
        var offset = Element.positionedOffset(this.container);
        var viewPort = document.viewport;
        Event.stopObserving(window, 'scroll');
        Event.observe(window, 'scroll', function () {
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
    initContainer: function (container) {
        this.container = container;
    },

    doAjax: function (url) {
        var loadDiv = document.createElement('div');
        loadDiv.innerHTML = '<div class="hb-loading">loading...</div>';
        this.ajaxizer.toolbar.insert({before: loadDiv.innerHTML});
        new Ajax.Request(
            url.replace(this.ajaxizer.ajaxParam, ''), {
                onSuccess: function (response) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response.responseText, "application/xhtml+xml");
                    $$('.hb-loading')[0].remove();
                    var productList = Prototype.Selector.select('.products-list', doc);
                    var productHtml = '';
                    if (productList.length <= 0) {
                        var productGrid = Prototype.Selector.select('.products-grid', doc);
                        productGrid.each(function (elem) {
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
                    $$('.pages').each(function (elem) {
                        elem.innerHTML = pages[0].innerHTML;
                    });
                    decorateGeneric($$('ul.products-grid'), ['odd', 'even', 'first', 'last']);
                    $$('body')[0].removeClassName('loading');
                    this.state = false;
                    this.initContainer($$(this.ajaxizer.gridSelector)[0]);
                }.bind(this)
            }
        );
    },
    outerHTML: function (node) {
        return node.outerHTML || (function (n) {
                var div = document.createElement('div'), html;
                div.appendChild(n.cloneNode(true));
                html = div.innerHTML;
                div = null;
                return html;
            })(node);
    }
}

var HB_AjaxCart = Class.create();
HB_AjaxCart.prototype = {
    initialize: function (ajaxizer) {
        this.ajaxizer = ajaxizer;
        this.cartButtons = $$('.cart a, .cart button');
        this.cartButtons.each(function (button) {
            Event.observe(button, 'click', function (e) {
                this.clickButton(e, button)
            }.bind(this));
        }.bind(this));
    },

    clickButton: function (event, button) {
        if (button.readAttribute('type') == 'submit') {
            this.ajaxizer.body.addClassName('loading');
            var form = $(button).up('form');
            form.request({
                parameters: {'useAjax': 1, 'update_cart_action': button.value},
                onSuccess: function (response) {
                    var json = response.responseText.evalJSON();
                    this.ajaxizer.content.innerHTML = json.content;
                    this.ajaxizer.topLinks.replace(json.toplinks);
                    this.ajaxizer.body.removeClassName('loading');
                    this.ajaxizer.init();
                }.bind(this)
            });
        } else if (button.readAttribute('href').indexOf('checkout/cart/delete') != -1) {
            this.ajaxizer.body.addClassName('loading');
            new Ajax.Request(
                this.ajaxizer.addAjaxToQuery(button.readAttribute('href')), {
                    onSuccess: function (response) {
                        var json = response.responseText.evalJSON();
                        this.ajaxizer.content.innerHTML = json.content;
                        this.ajaxizer.topLinks.replace(json.toplinks);
                        this.ajaxizer.body.removeClassName('loading');
                        this.ajaxizer.init();
                    }.bind(this)
                }
            );
        } else {
            return true;
        }
        event.preventDefault();
        return false;
    },
    submit: function (button, url, self) {
        if (self.validator.validate()) {
            var form = self.form;
            var oldUrl = form.action;

            if (url) {
                form.action = url;
            }
            var e = null;
            try {
                this.ajaxizer.body.addClassName('loading');
                new Ajax.Request(
                    this.ajaxizer.addAjaxToQuery(self.form.action) + '&' + self.form.serialize(), {
                        onSuccess: function (response) {
                            var json = response.responseText.evalJSON();
                            this.ajaxizer.topLinks.replace(json.toplinks);
                            this.ajaxizer.cartSidebar.replace(json.cart_sidebar);
                            this.ajaxizer.body.removeClassName('loading');
                            this.ajaxizer.infoboxContent.innerHTML = json.hb_messages;
                            this.ajaxizer.infobox.show();
                            this.ajaxizer.init();
                            button.disabled = false;
                        }.bind(this)
                    }
                );
            } catch (e) {
            }
            self.form.action = oldUrl;
            if (e) {
                throw e;
            }

            if (button && button != 'undefined') {
                button.disabled = true;
            }
        }
    }
}

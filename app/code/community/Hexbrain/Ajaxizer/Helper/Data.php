<?php
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
class Hexbrain_Ajaxizer_Helper_Data extends Mage_Core_Helper_Abstract
{
    /** @var bool Messages */
    private $_messages = false;

    /**
     * Store first level html tag name for messages html output
     *
     * @var string
     */
    protected $_messagesFirstLevelTagName = 'ul';

    /**
     * Store second level html tag name for messages html output
     *
     * @var string
     */
    protected $_messagesSecondLevelTagName = 'li';

    /**
     * Store content wrapper html tag name for messages html output
     *
     * @var string
     */
    protected $_messagesContentWrapperTagName = 'span';

    /** @var array Block names */
    private $_blocks = array(
        'content',
        'left',
        'top.links',
        'cart_sidebar',
        'hb_messages'
    );

    /**
     * Generates array with block html
     *
     * @param $layout Mage_Core_Model_Layout
     * @return array
     */
    public function getHtmlArray($layout)
    {
        $_html = array();
        foreach ($this->_blocks as $_name) {
            if ($_block = $layout->getBlock($_name)) {
                $_html[str_replace('.', '', $_name)] = $_block->toHtml();
            } else {
                switch ($_name) {
                    case 'cart_sidebar':
                        $_html[$_name] = $layout->createBlock('checkout/cart_sidebar')->setTemplate('checkout/cart/sidebar.phtml')->toHtml();
                        break;
                    case 'hb_messages':
                        $_html[$_name] = $this->getGroupedHtml();
                        break;
                }
            }
        }

        return $_html;
    }

    /**
     * Retrieve messages
     *
     * @return string
     */
    public function getGroupedHtml()
    {
        $types = array(
            Mage_Core_Model_Message::ERROR,
            Mage_Core_Model_Message::WARNING,
            Mage_Core_Model_Message::NOTICE,
            Mage_Core_Model_Message::SUCCESS
        );
        $html = '';
        foreach ($types as $type) {
            if ($messages = $this->getMessages($type)) {
                if (!$html) {
                    $html .= '<' . $this->_messagesFirstLevelTagName . ' class="messages">';
                }
                $html .= '<' . $this->_messagesSecondLevelTagName . ' class="' . $type . '-msg">';
                $html .= '<' . $this->_messagesFirstLevelTagName . '>';

                foreach ($messages as $message) {
                    $html.= '<' . $this->_messagesSecondLevelTagName . '>';
                    $html.= '<' . $this->_messagesContentWrapperTagName . '>';
                    $html.= ($this->_escapeMessageFlag) ? $this->htmlEscape($message->getText()) : $message->getText();
                    $html.= '</' . $this->_messagesContentWrapperTagName . '>';
                    $html.= '</' . $this->_messagesSecondLevelTagName . '>';
                }
                $html .= '</' . $this->_messagesFirstLevelTagName . '>';
                $html .= '</' . $this->_messagesSecondLevelTagName . '>';
            }
        }
        if ($html) {
            $html .= '</' . $this->_messagesFirstLevelTagName . '>';
        }
        return $html;
    }

    /**
     * Get Cart message collection
     *
     * @param Mage_Core_Model_Message $type
     * @return mixed
     */
    public function getMessages($type=null)
    {
        if (!$this->_messages) {
            $this->_messages = Mage::getSingleton('checkout/session')->getMessages(true);
        }

        return $this->_messages->getItems($type);
    }
}
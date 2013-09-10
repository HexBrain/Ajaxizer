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
    /** @var array Block names */
    private $_blocks = array(
        'content',
        'left',
        'top.links'
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
            }
        }

        return $_html;
    }
}
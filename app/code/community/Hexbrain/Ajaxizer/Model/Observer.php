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
class Hexbrain_Ajaxizer_Model_Observer
{
    /**
     * 'controller_action_layout_generate_blocks_after' event listener
     * set JSON response
     *
     * @param $observer Varien_Event_Observer
     */
    public function setAjaxResponse($observer)
    {
        $_session = Mage::getModel('core/session');
        if (Mage::app()->getRequest()->getParam('useAjax') == 1 || $_session->getUseAjax()) {
            $response = Mage::getModel('hb_ajaxizer/response');
            $response->setData(Mage::helper('hb_ajaxizer')->getHtmlArray($observer->getLayout()));
            $this->_sendResponse($response);
        }
        $_session->unsetData('use_ajax');
    }

    /**
     * Output JSON response
     *
     * @param $data
     */
    private function _sendResponse($data)
    {
        $response = Mage::app()->getResponse();
        $response->setHeader('Content-type', 'application/json');
        echo $data->getJson();
        Mage::getModel('core/session')->unsetData('use_ajax');
        exit(0);
    }

    /**
     * 'controller_response_redirect' event listener
     * set useAjax param if ajax request
     *
     * @param $observer Varien_Event_Observer
     */
    public function setUseAjax($observer)
    {
        $_app = Mage::app();
        if ($_app->getRequest()->getParam('useAjax') == 1) {
            Mage::getModel('core/session')->setUseAjax(true);
        }
    }
}
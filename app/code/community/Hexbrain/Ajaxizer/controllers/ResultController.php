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
require('Mage/CatalogSearch/controllers/ResultController.php');

class Hexbrain_Ajaxizer_ResultController extends Mage_CatalogSearch_ResultController
{
    public function indexAction()
    {
        if ($this->getRequest()->getParam('useAjax')) {
            $query = Mage::helper('catalogsearch')->getQuery();
            /* @var $query Mage_CatalogSearch_Model_Query */

            $query->setStoreId(Mage::app()->getStore()->getId());

            if ($query->getQueryText() != '') {
                if (Mage::helper('catalogsearch')->isMinQueryLength()) {
                    $query->setId(0)
                        ->setIsActive(1)
                        ->setIsProcessed(1);
                }
                else {
                    if ($query->getId()) {
                        $query->setPopularity($query->getPopularity()+1);
                    }
                    else {
                        $query->setPopularity(1);
                    }

                    if ($query->getRedirect()){
                        $query->save();
                        $this->getResponse()->setRedirect($query->getRedirect());
                        return;
                    }
                    else {
                        $query->prepare();
                    }
                }

                Mage::helper('catalogsearch')->checkNotes();

                $this->loadLayout();
                $jsonData = array();
                $jsonData['content'] = $this->getLayout()->getBlock('content')->toHTml();
                $jsonData['left'] = $this->getLayout()->getBlock('left')->toHTml();
                $jsonData['ajaxizer'] = $this->getLayout()->getBlock('ajaxizer')->toHTml();
                $this->getResponse()->setHeader('Content-type', 'application/json');
                $this->getResponse()->setBody(json_encode($jsonData));
            }
        } else {
            parent::indexAction();
        }
    }
}
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
require('Mage/Catalog/controllers/CategoryController.php');

class Hexbrain_Ajaxizer_CategoryController extends Mage_Catalog_CategoryController
{
    public function viewAction()
    {
        if ($this->getRequest()->getParam('useAjax')) {
            if ($category = $this->_initCatagory()) {
                $design = Mage::getSingleton('catalog/design');
                $settings = $design->getDesignSettings($category);

                // apply custom design
                if ($settings->getCustomDesign()) {
                    $design->applyCustomDesign($settings->getCustomDesign());
                }

                Mage::getSingleton('catalog/session')->setLastViewedCategoryId($category->getId());

                $update = $this->getLayout()->getUpdate();
                $update->addHandle('default');

                if (!$category->hasChildren()) {
                    $update->addHandle('catalog_category_layered_nochildren');
                }

                $this->addActionLayoutHandles();
                $update->addHandle($category->getLayoutUpdateHandle());
                $update->addHandle('CATEGORY_' . $category->getId());
                $this->loadLayoutUpdates();

                // apply custom layout update once layout is loaded
                if ($layoutUpdates = $settings->getLayoutUpdates()) {
                    if (is_array($layoutUpdates)) {
                        foreach($layoutUpdates as $layoutUpdate) {
                            $update->addUpdate($layoutUpdate);
                        }
                    }
                }

                $this->generateLayoutXml()->generateLayoutBlocks();
                // apply custom layout (page) template once the blocks are generated
                if ($settings->getPageLayout()) {
                    $this->getLayout()->helper('page/layout')->applyTemplate($settings->getPageLayout());
                }

                $jsonData = array();
                $jsonData['content'] = $this->getLayout()->getBlock('content')->toHTml();
                $jsonData['left'] = $this->getLayout()->getBlock('left')->toHTml();
                $jsonData['ajaxizer'] = $this->getLayout()->getBlock('ajaxizer')->toHTml();
                $this->getResponse()->setHeader('Content-type', 'application/json');
                $this->getResponse()->setBody(json_encode($jsonData));
            }
        } else {
            parent::viewAction();
        }
    }
}
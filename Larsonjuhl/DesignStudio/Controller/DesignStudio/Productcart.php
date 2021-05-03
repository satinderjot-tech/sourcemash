<?php

namespace Larsonjuhl\DesignStudio\Controller\DesignStudio;

use Magento\Framework\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\App\Action\Action;
use Magento\Framework\Data\Form\FormKey;
use Magento\Checkout\Model\Cart;
use Magento\Catalog\Model\Product;
use Larsonjuhl\ProductConfigurator\Helper\Data as ProductConfiguratorHelper;

class ProductCart extends \Magento\Framework\App\Action\Action {

    protected $_resultPageFactory;
    protected $_customerSessionFactory;
    protected $resultJsonFactory;
    protected $cacheTypeList;
    protected $cacheFrontendPool;
    protected $_registry;
    protected $_categoryFactory;
    protected $_productConfiguratorHelper;
    protected $_productCollectionFactory;protected $formKey;protected $cart;


    public function __construct(
        Context $context,
        \Magento\Framework\View\Result\PageFactory $resultPageFactory,
        JsonFactory $resultJsonFactory,
        \Magento\Customer\Model\Session $customerSessionFactory,
        \Magento\Framework\App\Cache\TypeListInterface $cacheTypeList,
        \Magento\Framework\App\Cache\Frontend\Pool $cacheFrontendPool,
        \Magento\Catalog\Model\CategoryFactory $categoryFactory,
        \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory,FormKey $formKey,
        Cart $cart,
        Product $product,
        ProductConfiguratorHelper $productConfiguratorHelper,
        \Larsonjuhl\DesignStudio\Helper\DesignStudioHelper $helper
    ) {
        $this->_resultPageFactory = $resultPageFactory;
        $this->_customerSessionFactory = $customerSessionFactory;
        $this->resultJsonFactory = $resultJsonFactory;
        $this->_cacheTypeList = $cacheTypeList;
        $this->_cacheFrontendPool = $cacheFrontendPool;
        $this->helper = $helper;
        $this->_productConfiguratorHelper = $productConfiguratorHelper;
        $this->_categoryFactory = $categoryFactory;
        $this->_productCollectionFactory = $productCollectionFactory;
        $this->formKey = $formKey;
        $this->cart = $cart;
        $this->product = $product;
        parent::__construct($context);
    }

    public function execute() {

        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $dataId = json_decode(stripslashes($this->getRequest()->getParam('data'))); 
        $params = array();      
        $options = array();
        try{
            foreach ($dataId as $productId) {
              $product = $objectManager->create('\Magento\Catalog\Model\Product')->load($productId->id);
              $cart = $objectManager->create('Magento\Checkout\Model\Cart');   
              $uom = strtoupper($productId->uom);
              $params['qty'] = '1';          
              $params['uom'] = $uom;
              $params['product'] = $productId->id;
              $params['height'] = $productId->height;
              $params['height_fraction'] = '';
              $params['width'] = $productId->width;
              $params['width_fraction'] = '';
              $params['label_notes'] ='';
              $params['item_notes'] = '';
              $params['price'] = $productId->price;
              $dependencies = json_decode(base64_decode($this->helper->getDependencies()), true);              
              $uom_dep = $dependencies['dependencies'][$uom];
              $has_dim_height = false;
              $has_dim_width = false;
              if(array_key_exists('height', $uom_dep)){
                  $has_dim_height = true;
              }
              if(array_key_exists('width', $uom_dep)){
                  $has_dim_width = true;
              }
              foreach($params as $parm_key => $parm_val){
                  if(!$has_dim_height && ($parm_key == 'height' || $parm_key == 'height_fraction')){
                      $params[$parm_key] = '';
                  }
                  elseif(!$has_dim_width && ($parm_key == 'width' || $parm_key == 'width_fraction')){
                      $params[$parm_key] = '';
                  }
                  else{
                      $params[$parm_key] = $parm_val;
                  }
              }
             
                $additionalOptions = $this->_productConfiguratorHelper->getAdditionalOptionsdata($params);
                $product->addCustomOption('additional_options', $additionalOptions);
                $params['options'] = $options;
                $cart->addProduct($product, $params);
            }
                $cart->save();
                $status = true;
        } catch (\Magento\Framework\Exception\LocalizedException $e) {           
            $this->messageManager->addException($e,__('%1', $e->getMessage()));
            $status = false;
        } catch (\Exception $e) {
            $this->messageManager->addException($e, __('error.'));
            $status = false;
        }
        $dataArray = array();
         if($status)
          {
              $dataArray = [
                  'Message' => "Products Added into cart successFully",
                  'isSuccess' => true
              ];
          }
          else
          {
              $errorMessage =  $this->helper->getGlobalErrorMesssage();
              $dataArray = [
                  'Message' => $errorMessage,
                  'isSuccess' => false
              ];
          }
        $resultJson = $this->resultJsonFactory->create();
        $resultJson->setData($dataArray);
        return $resultJson;
       
   }

}
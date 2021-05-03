<?php 
namespace Larsonjuhl\DesignStudio\Controller\DesignStudio;

use Magento\Framework\App\Action\Context as Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Result\Page;
use Magento\Framework\App\Action\Action;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\Registry;


class ListingArtwork extends \Magento\Framework\App\Action\Action { 

    protected $_artwork;

    protected $_coreRegistry;

    protected $resultPageFactory;

    public function __construct(
        Context $context,
       \Larsonjuhl\DesignStudio\Helper\DesignStudioHelper $helper,
        Registry $coreRegistry,
        \Magento\Customer\Model\Session $customerSession,
        PageFactory $resultPageFactory,
    \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
    \Magento\Framework\View\Result\LayoutFactory $resultLayoutFactory
       
    ) {
        $this->helper = $helper;
        $this->_coreRegistry = $coreRegistry;
        $this->_customerSession = $customerSession;
        $this->resultPageFactory = $resultPageFactory;
        $this->resultJsonFactory = $resultJsonFactory;
        $this->_resultLayoutFactory = $resultLayoutFactory;        
        parent::__construct($context);
    }

  
    public function execute() { 
            if (!$this->_customerSession->isLoggedIn()) {
            $resultRedirect = $this->resultRedirectFactory->create();
            $resultRedirect->setPath('customer/account/login');
            return $resultRedirect;
        } else {           
            echo $this->artworkListing();
            die;
        }
    } 

    public function artworkListing()
    {
        $customerEmail ='';
        $customerEmail = $this->_customerSession->getCustomer()->getEmail();
        $dataArray =array(); 
        if($customerEmail){
            $responsedata = $this->helper->getListing($customerEmail);        
            
            if(isset($responsedata['isSuccess']) && $responsedata['isSuccess'])
            {
                $data = isset($responsedata['data']) ? $responsedata['data'] : '';
                if(count($data) > 0)
                {
                    $dataArray = [
                    'artworklist' => $data,
                    'isSuccess' => true
                    ];
                }
                else
                {
                    $listingMessage =  $this->helper->getListingErrorMesssage();
                    $dataArray = [
                    'isSuccess' => false,
                    'record_not_found' => $listingMessage
                ];
                }
                
            }
            else
            {
                $listingMessage =  $this->helper->getGlobalErrorMesssage();
                $dataArray = [
                    'isSuccess' => false,
                    'record_not_found' => $listingMessage
                ];
            }
        }
        else
            {
                $listingMessage =  $this->helper->getGlobalErrorMesssage();
                $dataArray = [
                    'isSuccess' => false,
                    'record_not_found' => $listingMessage
                ];
            }
        return json_encode($dataArray);
    }
  
}

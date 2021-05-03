<?php 
namespace Larsonjuhl\DesignStudio\Controller\DesignStudio;

use Magento\Framework\App\Action\Context as Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Result\Page;
use Magento\Framework\App\Action\Action;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\Registry;
use Magento\RequisitionList\Model\Action\RequestValidator;
use Magento\Framework\UrlInterface;



class Edit extends \Magento\Framework\App\Action\Action { 

    

    protected $_coreRegistry;

    private $_requestValidator;

    private $_resultFactory;

    private $redirectFactory;
    private $url;

    public function __construct(
        Context $context,
       \Larsonjuhl\DesignStudio\Helper\DesignStudioHelper $helper,
       \Magento\Customer\Model\Session $customerSession,
        Registry $coreRegistry,
        RequestValidator $requestValidator,
        ResultFactory $resultFactory,
        PageFactory $pageFactory,
        \Magento\Framework\Controller\Result\RedirectFactory $redirectFactory,
        UrlInterface  $url,
        \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
     \Magento\Framework\View\Result\LayoutFactory $resultLayoutFactory

       
    ) {
        $this->helper = $helper;        
        $this->_requestValidator = $requestValidator; 
        $this->_resultFactory = $resultFactory; 
        $this->_customerSession = $customerSession;
        $this->_coreRegistry = $coreRegistry;  
        $this->redirectFactory = $redirectFactory;
        $this->url = $url;
        $this->resultPageFactory = $pageFactory;
        $this->resultJsonFactory = $resultJsonFactory;
        $this->_resultLayoutFactory = $resultLayoutFactory;    
        parent::__construct($context);
    }

    public function execute()
    { 
            if (!$this->_customerSession->isLoggedIn()) {
                $resultRedirect = $this->resultRedirectFactory->create();
                $resultRedirect->setPath('customer/account/login');
                return $resultRedirect;
            } else {
                $resultRedirect = $this->_resultFactory->create(ResultFactory::TYPE_REDIRECT);
                $resultRedirect->setRefererUrl();
                try {
                    $quoteID ="";
                    $quoteID = $this->getRequest()->getParam('quoteguid');                    
                    $this->_customerSession->setQuoteId($quoteID);
                } 
                catch (\Magento\Framework\Exception\LocalizedException $e) {           
                    $this->messageManager->addException($e,__('%1', $e->getMessage()));
                } 
                $resultRedirect->setPath('lj-design-studio');
                return $resultRedirect;
             }
    } 
}

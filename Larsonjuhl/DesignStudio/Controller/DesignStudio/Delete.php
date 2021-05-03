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



class Delete extends \Magento\Framework\App\Action\Action { 

    

    protected $_coreRegistry;

    private $_requestValidator;

    private $_resultFactory;

    public function __construct(
        Context $context,
       \Larsonjuhl\DesignStudio\Helper\DesignStudioHelper $helper,
       \Magento\Customer\Model\Session $customerSession,
        Registry $coreRegistry,
        RequestValidator $requestValidator,
        ResultFactory $resultFactory

       
    ) {
        $this->helper = $helper;
        
        $this->_requestValidator = $requestValidator; 
        $this->_resultFactory = $resultFactory; 
        $this->_customerSession = $customerSession;
        $this->_coreRegistry = $coreRegistry;        
        parent::__construct($context);
    }

    public function execute() { 
            if (!$this->_customerSession->isLoggedIn()) {
            $resultRedirect = $this->resultRedirectFactory->create();
            $resultRedirect->setPath('customer/account/login');
            return $resultRedirect;
            } else { 
                $resultRedirect = $this->_resultFactory->create(ResultFactory::TYPE_REDIRECT);
                $resultRedirect->setRefererUrl();
                $successMessage = $this->helper->deleteSuccessMessage();
                $errorMessage = $this->helper->getGlobalErrorMesssage();         
                try {
                    $quoteId ='';
                    $quoteId =$this->getRequest()->getParam('quoteguid');
                    if($quoteId)
                    {
                        $responsedata = $this->helper->deleteArtwork($quoteId);        
                        if(isset($responsedata['isSuccess']) && $responsedata['isSuccess'])
                        {  
                            $_SESSION['artworkdeletesuccess'] = $successMessage; 
                        }
                        else
                        { 
                            $_SESSION['artworkdeleteerror'] = $errorMessage;
                        }
                    }
                    else
                    { 
                        $_SESSION['artworkdeleteerror'] = $errorMessage;
                    }
                }
               catch (\Exception $e) { 
                    $_SESSION['artworkdeleteerror'] = $errorMessage; 
                }
                $resultRedirect->setPath('designstudio/designstudio/index/');
                return $resultRedirect;
        }
    } 
}

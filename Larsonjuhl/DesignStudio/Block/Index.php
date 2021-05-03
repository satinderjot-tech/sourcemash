<?php

namespace Larsonjuhl\DesignStudio\Block;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Store\Model\ScopeInterface;
use Magento\Customer\Model\Session as CustomerSession;
use Magento\Framework\Registry;

class Index extends Template
{
    /**
     * @var ScopeConfigInterface
     */
    protected $_scopeConfig;

    protected $_artwork;

    /**
     * @var CustomerSession
     */
    protected $_customerSession;

    public function __construct(
        Context $context,
        ScopeConfigInterface $scopeConfig,
        CustomerSession $customerSession,
        Registry $coreRegistry,       
        array $data = []
    )
    {
        $this->_scopeConfig = $scopeConfig;
        $this->_customerSession = $customerSession;
        $this->_coreRegistry = $coreRegistry;
        parent::__construct($context, $data);
        $this->pageConfig->getTitle()->set(__('Saved Design'));
        


    }

    public function getArtwork()
    {      
        $customerEmail = $this->_customerSession->getCustomer()->getEmail();
        return $customerEmail;
    }
}
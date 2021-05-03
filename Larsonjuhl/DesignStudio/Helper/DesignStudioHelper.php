<?php

namespace Larsonjuhl\DesignStudio\Helper;

use Magento\Framework\App\Config\ScopeConfigInterface;
use \Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\ScopeInterface;


class DesignStudioHelper extends AbstractHelper
{

    
    private $_scopeConfig;

    /**
     * Data constructor.
     * @param Context $context
     * @param CustomerSession $customerSession
     * @param ScopeConfigInterface $scopeConfig
     * @param AdminUserCollection $adminUserCollection
     */
    public function __construct(
        Context $context,
        ScopeConfigInterface $scopeConfig
       
    )
    {
        $this->_scopeConfig = $scopeConfig;

        return parent::__construct($context);
    }

    
    /**
     * @param $fieldId
     * @return mixed
     */
    public function getConfig($fieldId)
    {
        return $this->_scopeConfig->getValue('designstudio_artwork/general_designstudio_artwork/' . $fieldId, ScopeInterface::SCOPE_STORE);
    }
    
    public function getApiConfig($fieldId){
        return $this->scopeConfig->getValue('order_stimulation/api_settings/'.$fieldId, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }

    /**
     * @return mixed
     */
    public function isDesignStudioEnable()
    {
        return $this->getConfig('enabled_designstudio_artwork');
    }

    public function deleteSuccessMessage()
    {
        return $this->getConfig('quote_delete_message');
    }

    public function restoreSuccessMessage()
    {
        return $this->getConfig('quote_restore_message');
    }

    public function shareSuccessMessage()
    {
        return $this->getConfig('quote_share_message');
    }

    public function removeSuccessMessage()
    {
        return $this->getConfig('quote_remove_message');
    }

    public function getApiTimeOutFromConfiguration($fieldId){
        $apiTimeOut = '';
        $apiTimeOut = $this->scopeConfig->getValue('apgee_api_timeout/timeout_settings/'.$fieldId, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        return $apiTimeOut;
    }

    public function getListingErrorMesssage()
      {
        return $this->getConfig('artwork_listing_error_message');
      }

    public function getGlobalErrorMesssage()
      {
        return $this->getConfig('artwork_error_message');
      }
   
     public function getDependencies()
    {
        $uomDependency = base64_encode($this->scopeConfig->getValue('uom_settings/uom_dependency_config/uom_dependency'));
        return $uomDependency;
    }
    public function getListing($email)
    {


        $apikey = $this->getConfig('artwork_api_key');
        $parameter = '?email='.$email;
        $apiTime = $this->getApiTimeOutFromConfiguration('shop_pricing_list_timeout');
        $ch = curl_init();
        $generateBearerAutherization = 'apikey:'.$apikey;
        $generateTokenHeaders = array('Content-Type: application/json', $generateBearerAutherization);
        $url = $this->getConfig('artwork_api_base_url'). $this->getConfig('artwork_api_listing_url').$parameter;

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, $apiTime);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $generateTokenHeaders);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);
        $responseData = json_decode($response);
        //  echo "<pre>";
        // print_r($responseData);
        // die("dcd");
        
        if(isset($responseData->isSuccess) && $responseData->isSuccess)
        {
            $api_data = isset($responseData->data) ? $responseData->data : false;
            $response = array("isSuccess"=>true, "data"=>$api_data);
        }
        else
        {
            $apiMessage =$this->getGlobalErrorMesssage();
            $response = array("error"=>$apiMessage,"isSuccess"=>false);
        }
        return $response;
        
    }

    public function deleteArtwork($quoteId)
    {

        $apikey = $this->getConfig('artwork_api_key');
        $parameter = '?quoteguid='.$quoteId.'&isDelete=true';
        $apiTime = $this->getApiTimeOutFromConfiguration('shop_pricing_list_timeout');
        $ch = curl_init();
        $generateBearerAutherization = 'apikey:'.$apikey;
        $generateTokenHeaders = array('Content-Type: application/json', $generateBearerAutherization, 'Content-Length: 0');
        $url =$this->getConfig('artwork_api_base_url'). $this->getConfig('artwork_api_delete_restore').$parameter;
        


        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, $apiTime); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, $generateTokenHeaders);  
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');

        $response = curl_exec($ch);
        curl_close($ch);
        $responseData = json_decode($response);
        
        if(isset($responseData->isSuccess) && $responseData->isSuccess)
        {
             $response = array("isSuccess"=>true, "Message"=>$responseData->message);
        }
        else
        {
            $response = array("isSuccess"=>false, "Message"=>'Try Again');
        }
        return $response;
        
    }

    public function removeArtwork($quoteId)
    {

        $apikey = $this->getConfig('artwork_api_key');
        $parameter = '?quoteId='.$quoteId.'&isDelete=true';
        $apiTime = $this->getApiTimeOutFromConfiguration('shop_pricing_list_timeout');
        $ch = curl_init();
        $generateBearerAutherization = 'apikey:'.$apikey;
        $generateTokenHeaders = array('Content-Type: application/json', $generateBearerAutherization, 'Content-Length: 0');
        $url =$this->getConfig('artwork_api_base_url'). $this->getConfig('artwork_remove_quote_url').$parameter;
        

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, $apiTime); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, $generateTokenHeaders);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');

        $response = curl_exec($ch);
        curl_close($ch);
        $responseData = json_decode($response);
        if(isset($responseData->isSuccess) && $responseData->isSuccess)
        {
             $response = array("isSuccess"=>true, "Message"=>$responseData->message);
        }
        else
        {
            $response = array("isSuccess"=>false, "Message"=>'Try Again');
        }
        return $response;
        
    }


    public function restoreArtwork($quoteId)
    {

        $apikey = $this->getConfig('artwork_api_key');
        $parameter = '?quoteguid='.$quoteId.'&isDelete=false';
        $apiTime = $this->getApiTimeOutFromConfiguration('shop_pricing_list_timeout');
        $ch = curl_init();
        $generateBearerAutherization = 'apikey:'.$apikey;
        $generateTokenHeaders = array('Content-Type: application/json', $generateBearerAutherization, 'Content-Length: 0');
        $url = $this->getConfig('artwork_api_base_url'). $this->getConfig('artwork_api_delete_restore').$parameter;


        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, $apiTime); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, $generateTokenHeaders);         
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');       

        $response = curl_exec($ch);
        curl_close($ch);
        $responseData = json_decode($response);
        
        if(isset($responseData->isSuccess) && $responseData->isSuccess)
        {
             $response = array("isSuccess"=>true, "Message"=>$responseData->message);
        }
        else
        {
            $response = array("isSuccess"=>false, "Message"=>'try again');
        }
        return $response;
        
    }

    public function getQuote($quoteId)
    {

        $apikey = $this->getConfig('artwork_api_key');
        $parameter = '?quoteId='.$quoteId;
        $apiTime = $this->getApiTimeOutFromConfiguration('shop_pricing_list_timeout');
        $ch = curl_init();
        $generateBearerAutherization = 'apikey:'.$apikey;
        $generateTokenHeaders = array('Content-Type: application/json', $generateBearerAutherization, 'Content-Length: 0');
        $url =$this->getConfig('artwork_api_base_url'). $this->getConfig('artwork_api_get_quote_url').$parameter;


        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, $apiTime);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $generateTokenHeaders);       
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');       

        $response = curl_exec($ch);
        curl_close($ch);
        $responseData = json_decode($response);
       // echo "<pre>";
       //  print_r($responseData);
       //  die(); 
        
        
        if(isset($responseData->isSuccess) && $responseData->isSuccess)
        {
            $api_data = isset($responseData->data) ? $responseData->data : false;
            $response = array("isSuccess"=>true, "data"=>$api_data);
        }
        else
        {
            $response = array("isSuccess"=>false, "Message"=>'try again');
        }
        return $response;
    }
}
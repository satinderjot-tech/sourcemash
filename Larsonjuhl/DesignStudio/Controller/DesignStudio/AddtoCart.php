<?php 
namespace Larsonjuhl\DesignStudio\Controller\DesignStudio;

use Magento\Framework\App\Action\Context as Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Result\Page;
use Magento\Framework\App\Action\Action;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\Registry;


class AddToCart extends \Magento\Framework\App\Action\Action { 

    protected $_artwork;
    protected $_coreRegistry;
    protected $resultPageFactory;
    protected $storeManager;

    public function __construct(
        Context $context,
       \Larsonjuhl\DesignStudio\Helper\DesignStudioHelper $helper,
        Registry $coreRegistry,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Customer\Model\Session $customerSession,
        PageFactory $resultPageFactory,
    \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
    \Magento\Framework\View\Result\LayoutFactory $resultLayoutFactory,
    \Larsonjuhl\ProductOptions\Helper\Data $helperData
       
    ) {
        $this->helper = $helper;
        $this->_coreRegistry = $coreRegistry;
        $this->_customerSession = $customerSession;
        $this->resultPageFactory = $resultPageFactory;
        $this->resultJsonFactory = $resultJsonFactory;
        $this->_resultLayoutFactory = $resultLayoutFactory;
        $this->storeManager = $storeManager; 
        $this->helperData = $helperData;       
        parent::__construct($context);
    }

  
    public function execute() { 
            if (!$this->_customerSession->isLoggedIn()) {
            $resultRedirect = $this->resultRedirectFactory->create();
            $resultRedirect->setPath('customer/account/login');
            return $resultRedirect;
        } else {           
            echo $this->artworkQuote();
            die;
        }
    } 

    public function artworkQuote()
    {
        
        $quoteID = isset($_POST['quoteId']) ? $_POST['quoteId'] : '';
        $dataArray = array();
        $errorMessage =  $this->helper->getGlobalErrorMesssage();
        if($quoteID)
        {
            $responsedata = $this->helper->getQuote($quoteID);
            if(isset($responsedata['isSuccess']) && $responsedata['isSuccess'])  
            {
                $data = isset($responsedata['data']) ? $responsedata['data'] : '';
                $skuFinal = [];
                  foreach ($data as $key => $value) {
                      for ($i=1; $i <= 6; $i++) { 
                           $strPart = explode($i, $key);
                           if(isset($strPart[1])){
                              if($strPart[0] =='isTextureMat'){
                                $skuFinal['mat'.$i]['isTextureMat'] = $value;
                              }else{
                                  $skuFinal[$strPart[0].$i][$strPart[1]] = $value;
                              }
                            
                           }
                      }  

                  }

                
                $skuFinal= array_filter($skuFinal, array($this,"getFinalData"));
                if(count($skuFinal) > 0)
                {
                    $productData = $this->priceCalculation($skuFinal);
                    $newArray = array();
                    $index=0;
                    foreach($skuFinal as $key=>$val){ 
                        $newArray[$key] = $val;
                        if(count($productData) > 0) 
                        {
                          $newArray[$key]['availablity']=$productData[$index];
                          $index++;
                        }
                     }
                    if(count($newArray) > 0)
                      {
                          if(count($productData) > 0)
                          {
                            $dataArray = ['productdata' => $newArray, 'isSuccess' => true, 'IsAddToCart' => true, 'IsShare'=>true];
                          }
                          else
                          {
                            $dataArray = ['productdata' => $newArray, 'isSuccess' => true,  'IsAddToCart' => false, 'IsShare'=>true];
                          }
                          
                      }
                      else
                      { 
                          $dataArray = ['isSuccess' => false, 'record_not_found' => $errorMessage, 'IsAddToCart' => false, 'IsShare'=>true];
                      }
                  
                }
                else
                {
                    $dataArray = ['isSuccess' => false, 'record_not_found' => $errorMessage, 'IsAddToCart' => false, 'IsShare'=>true];
                } 
            } 
            else
                {
                    $dataArray = ['isSuccess' => false, 'record_not_found' => $errorMessage, 'IsAddToCart' => false, 'IsShare'=>false];
                } 
        }
        else
        {
            $dataArray = ['isSuccess' => false, 'record_not_found' => $errorMessage, 'IsAddToCart' => false, 'IsShare'=>false];
        }
        
        return json_encode($dataArray);  
        
    }
    public function getFinalData($skuFinal)          
      {
        if($skuFinal['Sku'] && $skuFinal['Sku'] != '0')
        {
          return true;
        }
         return false;
      }
      

    public function priceCalculation($skuFinal)
    {

        $item_array = array();
        $itemPushArray = array();
        $apiCountry = $this->storeManager->getStore()->getCode();
        $account_number = $this->_customerSession->getCustomer()->getAccountNumber();
        $widthInches = $widthNumerator = $widthDenominator = $heightInches = $heightNumerator = $heightDenominator = $sku = $UOM = $itemQty = '';

        $apiBaseurl = $this->helper->getApiConfig('base_url'); 
        $apiMode = $this->helper->getApiConfig('stimulation_mode');
        $apiCountry = $this->helper->getApiConfig('stimulation_country');
        $apiKey= $this->helper->getApiConfig('stimulation_apikey');
        $uomMappings = $this->helperData->getUomCodes();
        foreach ($skuFinal as $Item) {
          if($Item['Sku'] != '') {
            $sku = isset($Item['Sku']) ? $Item['Sku'] : '';
            $UOM=isset($Item['Uom']) ? strtoupper($Item['Uom']) :'';
            $UOM=isset($uomMappings[$UOM]) ? $uomMappings[$UOM] :'';
            $itemQty = "01";
            $widthInches = isset($Item['Width']) ? round($Item['Width']) : " 00 ";
            $widthInches = (string)$widthInches;
            $heightInches = isset($Item['Height']) ? round($Item['Height']) : " 00 "; 
            $heightInches = (string)$heightInches;
            
            if(($UOM == "EA") || ($UOM == "FT") || ($UOM == "L"))
            {
              $widthInches = "0";
              $heightInches = "0";
            }
            $itemsEach =array (
                                    'WONo' => '',
                                    'WLine' => '',
                                    'OQty' => $itemQty,
                                    'LongItemNo' => $sku,
                                    'UOM' => $UOM,
                                    'Dim' => 
                                    array (
                                      'Width' => 
                                      array (
                                        'Inches' => $widthInches,
                                        'Numerator' => $widthNumerator,
                                        'Denominator' => $widthDenominator, 
                                      ),
                                      'Length' => 
                                      array (
                                        'Inches' => $heightInches,
                                        'Numerator' => $heightNumerator,
                                        'Denominator' => $heightDenominator,
                                      ),
                                    ),
                                    'CNOTE' => '',
                                    'Printmsg' => '',
                                    'WORD' => '',
                                    'WORD_TYPE' => '',
                                    'CNAME' => '',
                                    'CORDNO' => '',
                                    'MatCutterType' => '',
                                    'NOOPENING' => '',
                                    'NOVGROOVE' => '',
                                    'CUTMATPATTERNNO' => '',
                                    'AGREENO' => '',
                                    'AssemblyRqd' => '',
                                    'BOFLAG' => '',
                                    'PromoCode' => '',
                                    'PromoPrice' => '',
                                    'OFlag' => '',
                                    'isCombo' => '',
                                    'oBranch' => '',
                                    'routeCode' => '',
                                    'crossDock' => '',
                                    'shipCharge' => '',
                                  );    

          array_push($item_array,$itemsEach);
           }
          
        }
       //echo "<pre>"; print_r($item_array);
        //die();

        $body = array('ORDHDR' => array (
                                            'Mode' => $apiMode,
                                            'OBy' => '',
                                            'WONo' => '',
                                            'CNo' => $account_number, 
                                            'PONo' => '',
                                            'PhNo' => '',
                                            'CName' => '',
                                            'CCNo' => '',
                                            'CCM' => '',
                                            'CCY' => '',
                                            'PayTerms' => '',
                                            'PayTermsD' => '',
                                            'ShipTo' => 
                                            array (
                                              'Addr1' => '',
                                              'Addr2' => '',
                                              'Addr3' => '',
                                              'Addr4' => '',
                                              'State' => '',
                                              'Zip' => '',
                                              'Route' => '',
                                              'RouteStop' => '',
                                            ),
                                          ),
                                          'ORDDTL' => 
                                          array (
                                            'ORDITM' => $item_array
                                            
                                          ),
                                        );


            $url = $apiBaseurl."accountNumber=".$account_number."&country=".$apiCountry;

            $body_string = json_encode($body);
            //echo "<pre>"; print_r($body);
            $header = array(
                'Accept: application/json',
                'Content-Type: application/json',
                'Content-Length: '.strlen($body_string),
                'apikey:'.$apiKey,
            );

            $apiTime = $this->helper->getApiTimeOutFromConfiguration('requisition_timeout');

            $curl = curl_init($url);
            curl_setopt($curl, CURLOPT_TIMEOUT_MS, $apiTime);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $body_string);

            $json_response = curl_exec($curl);
            $response = json_decode($json_response, true);
              //echo "<pre>"; print_r($response);
            if(isset($response['IsSuccess']) && $response['IsSuccess']=='true')
             { 
              $items = isset($response['responsJson']) ? $response['responsJson'] : '';
              $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
              
                $index =0;
                foreach ($items as $item)
                {
                  $itemPushArray[$index]['price']= $item['EPrice'];
                  $itemPushArray[$index]['sku']= $item['LItemno'];
                  $itemPushArray[$index]['productId']= $objectManager->get('Magento\Catalog\Model\Product')->getIdBySku($item['LItemno']);

                  $itemPushArray[$index]['uom']= $item['UOM'];
                  $itemPushArray[$index]['IsBackOrdered'] = '';
                  $branchQty = $item['AvailablityResponse']['BranchQuantity'];
                  $CbranchQty = $item['AvailablityResponse']['CentralQuantity'];
                  $proQty = $item['OQuantity'];

                  /**** Code for Discontinued item******/
                    $discontFlag = $item['AvailablityResponse']['discontinuedItemFlag'];
                    $itemNo = $item['LItemno'];
                    $txtQuantity = $item['OQuantity'];
                    $availableQuantity = $item['AvailablityResponse']['BranchQuantity'];
                    $isDis = $this->isDiscontinued($itemNo, $txtQuantity, $availableQuantity, $discontFlag);
                    if($isDis){
                       $itemPushArray[$index]['isDisItem'] = 1;
                    }else{
                       $itemPushArray[$index]['isDisItem'] = '';
                    }
                  /****Code for Discontinued item ***/
                  if(trim($item['UOM']) == 'C' || trim($item['UOM']) == 'W' || trim($item['UOM']) == 'BX'){
                      if ($branchQty < $proQty && $CbranchQty < $proQty){    
                          $itemPushArray[$index]['IsBackOrdered'] = 1;
                      }
                  }
                  elseif ($branchQty < $proQty) {
                    $itemPushArray[$index]['IsBackOrdered'] = 1;
                  }
                  $itemPushArray[$index]['IsAddToCart']=$item['AvailablityResponse']['IsAddToCart'];
                  $itemPushArray[$index]['IsBackOrder']=$item['AvailablityResponse']['IsBackOrder'];
                   $index++; 
                  }
                }
              return $itemPushArray;
    }

        public function isDiscontinued($itemNo, $txtQuantity, $availableQuantity, $discontinuedItemFlag){
       if ( ( ( strpos( strtoupper( substr( $itemNo, 0, 2 ) ), 'CS' ) !== false ) || ( strpos( strtoupper( substr( $itemNo, 0, 2 ) ), 'AS' ) !== false ) ) && ( $discontinuedItemFlag == 'O' ) || ( $txtQuantity > $availableQuantity && ( $discontinuedItemFlag == 'U' ) ) || $discontinuedItemFlag == 'O' ) {
            return true;
        }else{
            return false;
        }
    }
  
}

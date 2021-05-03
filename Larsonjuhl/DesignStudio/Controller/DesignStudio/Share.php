<?php 
namespace Larsonjuhl\DesignStudio\Controller\DesignStudio;

use Magento\Framework\App\Action\Context as Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Result\Page;
use Magento\Framework\App\Action\Action;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\Registry;


class Share extends \Magento\Framework\App\Action\Action { 

    protected $jsonHelper;

    protected $resultJsonFactory;

    protected $scopeConfig;

    protected $_request;

    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\Json\Helper\Data $jsonHelper,
        \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Customer\Model\Session $customerSession,
        \Larsonjuhl\DesignStudio\Helper\DesignStudioHelper $helper
        ) {
        $this->jsonHelper = $jsonHelper;
        $this->resultJsonFactory = $resultJsonFactory;
        $this->scopeConfig = $scopeConfig;
        $this->_customerSession = $customerSession;
        $this->helper = $helper;
        return parent::__construct($context);
    }

  
    public function execute() { 
            if (!$this->_customerSession->isLoggedIn()) {
            $resultRedirect = $this->resultRedirectFactory->create();
            $resultRedirect->setPath('customer/account/login');
            return $resultRedirect;
        } else {           
            echo $this->shareEmail();
            die;
        }
    } 

    public function shareEmail()
    {
        
        $customoptions = array();
        if(isset($_POST['form_data']) && $_POST['form_data'])
        {
          $formData      = explode( '&', $_POST['form_data'] );
          foreach ($formData as $value ) {
              $options = explode( '=', $value );
              $customoptions[$options[0]] = urldecode( $options[1] );
          }
        }
        $sender = isset($customoptions['sender-email']) ? $customoptions['sender-email'] : '';
        $receipt = isset($customoptions['receipt-email']) ? $customoptions['receipt-email'] : '';
        $comment = isset($customoptions['comment']) ? $customoptions['comment'] : '';
        $artname = isset($_POST['artname']) ? $_POST['artname'] : '';
        $artfinishdimension = isset($_POST['artfinishdimension']) ? $_POST['artfinishdimension'] : '';
        $artdimension = isset($_POST['artdimension']) ? $_POST['artdimension'] : '';
        $glazingSku = isset($_POST['glazingSku']) ? $_POST['glazingSku'] : '';
        $glazingName = isset($_POST['glazingName']) ? $_POST['glazingName'] : '';
        $artimage = isset($_POST['artimage']) ? $_POST['artimage'] : '';
        $artwork = isset($_POST['quotedata']) ? $_POST['quotedata'] : '';

        $html ="";       
        $html .="<table width='800' align='center' border='0' cellspacing='0' cellpadding='0' style='color: #354552; font-family: 'Franklin Gothic Book'; font-weight: normal;'>";
        $html .="<tbody>";
        $html .="<tr>
                    <td height='30'></td>
                </tr>
                <tr>
                    <td>
                      <h1 style='font-size: 24px; color: #73653d; text-align: center; line-height: 30px;'>Thanks for choosing <br>LJ Design studio</h1>
                      </td>
                </tr>
                <tr>
                    <td style='background-image: url('".$this->helper->getConfig('artwork_email_template_image_base_url')."images/banner.png'); background-repeat: no-repeat; background-size: cover; background-position: 10px 0; text-align: center; padding: 0 0 20px;'>
                      <img src='".$artimage."' title='Frame' alt='Frame' width='446' height='297' style='margin: 45px auto 0; display: block;'>
                    </td>
                </tr>
                <tr>
                    <td height='30'></td>
                </tr>";



        $html .="<tr>
                    <td>
                    <table width='100%' align='left' border='0' cellspacing='0' cellpadding='0'>
                    <tbody>
                    <tr>";
        if((isset($artwork['frame3']) && $artwork['frame3']) || (isset($artwork['frame2']) && $artwork['frame2']) || (isset($artwork['frame1']) && $artwork['frame1']) || (isset($artwork['mat1']) && $artwork['mat2']) || (isset($artwork['mat2']) && $artwork['mat2']) || (isset($artwork['mat3']) && $artwork['mat3']) || (isset($artwork['fillet1']) && $artwork['fillet1']) || (isset($artwork['fillet3']) && $artwork['fillet3']) || (isset($artwork['fillet5']) && $artwork['fillet5']) || (isset($artwork['glazing1']) && $artwork['glazing1']))
        {
        $html .="<td width='50%' style='border-right: 1px solid rgba(53,59,82,.2); padding-right: 20px;'>";
        }
        $html .=" <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                    <tbody>";
        $html .=" <tr>
                        <td height='30'></td>
                      </tr>
                      <tr>
                        <th colspan='2' style='text-align: left; font-family: 'Franklin Gothic Medium'; font-weight: 500; font-size: 18px;'>Art</th>
                      </tr>
                      <tr>
                        <td height='15' colspan='2'></td>
                      </tr>
                      <tr>
                        <td>Art Name</td>
                        <td style='text-align: right;'>".$artname."</td>
                      </tr>
                      <tr>
                        <td height='10' colspan='2'></td>
                      </tr>
                      <tr>
                        <td width='30%'>Art Dimensions</td>
                        <td style='text-align: right;'>".$artdimension."</td>
                      </tr>
                      <tr>
                        <td height='10' colspan='2'></td>
                      </tr>
                      <tr>
                        <td>Finished Outer Dimensions</td>
                        <td style='text-align: right;'>".$artfinishdimension."</td>
                      </tr>
                      <tr>
                        <td height='30' colspan='2'></td>
                      </tr>";
        if((isset($artwork['frame3']) && $artwork['frame3']) || (isset($artwork['frame2']) && $artwork['frame2']) || (isset($artwork['frame1']) && $artwork['frame1']))
        {
          $html .= "<tr>
          <th colspan='2' style='text-align: left; font-family: 'Franklin Gothic Medium'; font-weight: 500; font-size: 18px;'>Frames</th>
        </tr>";
        }
                      
        if(isset($artwork['frame3']) && $artwork['frame3'])
        {
            $html .="<tr>
                        <td width='10%''>Inner</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['frame3']['Sku'].",".$artwork['frame3']['Name']."</td>
                      </tr>";
        }
        if((isset($artwork['frame1']) && $artwork['frame1']) && (isset($artwork['frame2']) && $artwork['frame2']))
        {
            $html .="<tr>
                        <td width='10%''>Middle</td>
                        <td style='text-align: right;'>#".$artwork['frame2']['Sku'].",".$artwork['frame2']['Name']."</td>
                      </tr>";
            $html .="<tr>
                        <td width='10%''>Outer</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['frame1']['Sku'].",".$artwork['frame1']['Name']."</td>
                      </tr>";
        }
        elseif(isset($artwork['frame2']) && $artwork['frame2'])
        {
            $html .="<tr>
                        <td width='10%''>Outer</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['frame2']['Sku'].",".$artwork['frame2']['Name']."</td>
                      </tr>";
        }
        

        $html .="<tr>
                        <td height='10' colspan='2'></td>
                      </tr>";
        $html .="</tbody>
                  </table>
                </td>";


        $html .="<td width='50%' style='padding-left: 20px;'>
                  <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                    <tbody>";
        $html .="<tr>
                        <td height='30'></td>
                      </tr>";
          if((isset($artwork['mat1']) && $artwork['mat1']) || (isset($artwork['mat2']) && $artwork['mat2']) || (isset($artwork['mat3']) && $artwork['mat3']))
          {
            $html .="<tr><th colspan='2' style='text-align: left; font-family: 'Franklin Gothic Medium'; font-weight: 500; font-size: 18px;'>Matboard</th>
                      </tr>
                      <tr>
                        <td height='15' colspan='2'></td>
                      </tr>";
          }            
         

        if(isset($artwork['mat1']) && $artwork['mat1'])
        {
            $html .="<tr>
                        <td width='10%''>Inner</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['mat1']['Sku'].",".$artwork['mat1']['Name']."</td>
                      </tr>";
        }
        if((isset($artwork['mat2']) && $artwork['mat2']) && (isset($artwork['mat3']) && $artwork['mat3']))
        {
            $html .="<tr>
                        <td width='10%''>Middle</td>
                        <td style='text-align: right;'>#".$artwork['mat2']['Sku'].",".$artwork['mat2']['Name']."</td>
                      </tr>";
            $html .="<tr>
                        <td width='10%''>Outer</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['mat3']['Sku'].",".$artwork['mat3']['Name']."</td>
                      </tr>";
        }
        elseif(isset($artwork['mat3']) && $artwork['mat3'])
        {
            $html .="<tr>
                        <td width='10%''>Outer</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['mat3']['Sku'].",".$artwork['mat3']['Name']."</td>
                      </tr>";
        }
        $html .="<tr>
                        <td height='15' colspan='2'></td>
                      </tr>";
        if((isset($artwork['fillet1']) && $artwork['fillet1']) || (isset($artwork['fillet3']) && $artwork['fillet3']) || (isset($artwork['fillet5']) && $artwork['fillet5']))
        {
          $html .="<tr>
                        <th colspan='2' style='text-align: left; font-family: 'Franklin Gothic Medium'; font-weight: 500; font-size: 18px;'>Fillet</th>
                      </tr>";
        }

        


        if(isset($artwork['fillet1']) && $artwork['fillet1'])
        {
            $html .="<tr>
                        <td width='10%''>Inner</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['fillet1']['Sku'].",".$artwork['fillet1']['Name']."</td>
                      </tr>";
        }
        if((isset($artwork['fillet3']) && $artwork['fillet3']) && (isset($artwork['fillet5']) && $artwork['fillet5']))
        {
            $html .="<tr>
                        <td width='10%''>Middle</td>
                        <td style='text-align: right;'>#".$artwork['fillet3']['Sku'].",".$artwork['fillet3']['Name']."</td>
                      </tr>";
            $html .="<tr>
                        <td width='10%''>Outer</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['fillet5']['Sku'].",".$artwork['fillet5']['Name']."</td>
                      </tr>";
        }
        elseif(isset($artwork['fillet5']) && $artwork['fillet5'])
        {
            $html .="<tr>
                        <td width='10%''>Outer</td>
                        <td width='90%'' style='text-align: right;''>#".$artwork['fillet5']['Sku'].",".$artwork['fillet5']['Name']."</td>
                      </tr>";
        }
        if(isset($artwork['glazing1']) && $artwork['glazing1'])
        {
           $html .="<tr>
                        <td height='30' colspan='2'></td>
                      </tr>
                    <tr>
                        <th colspan='2' style='text-align: left; font-family: 'Franklin Gothic Medium'; font-weight: 500; font-size: 18px;'>Glazing</th>
                      </tr>
                      <tr>
                        <td>Name</td>
                        <td style='text-align: right;'>#".$artwork['glazing1']['Sku'].",".$artwork['glazing1']['Name']."</td>
                      </tr>
                      <tr>
                        <td height='10' colspan='2'></td>
                      </tr>";
        }
       
        $html .="</tbody>
                  </table>
                </td>";


        $html .="</tr>
                </tbody>
                </table>
                </td>
                </tr>";


        $html .="<tr>
                    <td height='50'></td>
                  </tr>
                  <tr>
                    <th style='text-align: left; font-family: 'Franklin Gothic Medium'; font-weight: 500; font-size: 18px;'>Comments</th>
                  </tr>
                  <tr>
                    <td height='15'></td>
                  </tr>
                  <tr>
                  <td><table width='100%'' cellspacing='0' cellpadding='0' border='0'>
                  <tbody>
                    <tr>
                  <td>".$comment."</td>
                  </tr>
                  </tbody>
                </table></td>
                    
                  </tr>
                  <tr>
                    <td colspan='2' height='30'></td>
                </tr>";
        $html .="</tbody>";
        $html .="</table>";
        $html .="<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script>
          <script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js'></script>
          <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'></script>
          <script src='https://use.fontawesome.com/a37199fbfc.js'></script>
          <script src='js/imageuploadify.min.js'></script>
          <script src='js/custom.js'></script>";
        $data = array(
            "userDetails"=>array(array(
                "email" => $receipt, 
                "firstName" => "", 
                "postalCode" => "", 
                "lastName" => "", 
                "accountNumber" => "", 
                "phone" => "", 
                "state" => "", 
                "store" => "", 
                "ccEmail" => ""
            )),
            "artWork" => $html, 
            "senderEmail" => $sender
        );


        /*************** GENERATE APIGEE TOKEN ***********************************/
        $username = $this->getConfig('token_username');
        $password = $this->getConfig('token_password');
        $generateTokenUrl = $this->getConfig('base_url').$this->getConfig('token_endpoint');
        $generateTokenAutherization = 'Authorization: Basic '.base64_encode($username.':'.$password);
        $generateTokenHeaders = array('Content-Type: application/json', 'grant_type: client_credentials', $generateTokenAutherization);
        $generateTokenUrlHandler = curl_init();
        curl_setopt($generateTokenUrlHandler, CURLOPT_URL, $generateTokenUrl);
        curl_setopt($generateTokenUrlHandler, CURLOPT_HTTPHEADER, $generateTokenHeaders);
        curl_setopt($generateTokenUrlHandler, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($generateTokenUrlHandler);
        curl_close($generateTokenUrlHandler);
        $verifyData =  $this->jsonHelper->jsonDecode($response);
        $apigeeToken = $verifyData['access_token'];
        
        /*************** END GENERATE APIGEE TOKEN ***********************************/
        $payload = json_encode($data);        
        $ch = curl_init();
        $generateBearerAutherization = 'Authorization: Bearer '.$apigeeToken;
        $generateTokenHeaders = array('Content-Type: application/json', $generateBearerAutherization);
        //$url = $this->getConfig('base_url').'v1/email/artwork/emailShare';
        $url = $this->helper->getConfig('artwork_share_quote_url');
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $generateTokenHeaders);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $avsResponse = curl_exec($ch);
        curl_close($ch);
        $response_decode = json_decode($avsResponse);
        //echo "<pre>";
        $response_decode =json_decode($response_decode);

        

        $dataArray = array();
          if($response_decode->success)
          {
            $successMessage = $this->helper->shareSuccessMessage();
              $dataArray = [
                  'Message' => $successMessage,
                  'isSuccess' => true
              ];
          }
          else
          {
            $errorMessage = $this->helper->getGlobalErrorMesssage();
              $dataArray = [
                  'isSuccess' => false,
                  'Message' => $errorMessage,
              ];
          }
  //          echo "<pre>";
  // print_r($dataArray);
        return json_encode($dataArray);


    }

    public function getConfig($fieldId){
      return $this->scopeConfig->getValue('usps_avs/api_settings/'.$fieldId, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }
  
}

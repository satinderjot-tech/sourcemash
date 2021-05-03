define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'mage/url'
    /*'Larsonjuhl_CustomerEmulationListing/js/jquery-dataTables-min'*/
], function ($, modal, urlBuilder) {
    'use strict';

    jQuery(document).ready(function () {

        /* Share email popup validation start*/
        $(document).on('click', function (event) {
          if (!$(event.target).closest('input, textarea').length) {
             if ($('#receipt-email').val() == "")
            { 
                $("label[for='receiptemail']").removeClass("on");
            }
            if ($("textarea[name='comment']").val() == "")
            {
               $("label[for='comment']").removeClass("on");
            }
          }
        });
        
        $("#receipt-email").click(function()
        {
           $(this).closest('.label-inside').find( ".label-control" ).addClass('on');
        });
        $("textarea[name='comment']").click(function()
        {
            console.log("test");
            $(this).closest('.label-inside').find( ".label-control" ).addClass('on');
        });
        /* Share email popup validation end*/
       

         /* Listing of artwork on page load*/
        if(localStorage.getItem("current_design_tab") !==null )
        {
            
            var tab = localStorage.getItem("current_design_tab");
            $('.clickme a').removeClass('activelink');
            $('.clickme').removeClass('current');
            if(tab == 'tabActive')
            {
                $(".tabActive").addClass('activelink');
                $(".tabActive").parent().addClass('current');
                $('.artworklist').removeClass('active').addClass('hide');
                $('#tabActive').addClass('active').removeClass('hide');
                listingDataActive();
                localStorage.removeItem("current_design_tab");

            }
            else
            {
                $(".tabArchive").addClass('activelink');
                $(".tabArchive").parent().addClass('current');
                $('.artworklist').removeClass('active').addClass('hide');
                $('#tabArchive').addClass('active').removeClass('hide');
                listingDataArchive();
                localStorage.removeItem("current_design_tab");
            }
        }
        else
        {
            
            listingDataActive(); 

        }

        
       
        /* tabs functionality start */
        $('.clickme a').click(function(){
            $('.clickme a').removeClass('activelink');
            $('.clickme').removeClass('current');
            $(this).addClass('activelink');
            $(this).parent().addClass('current');
            var tagid = $(this).data('tag');
            
            $('.artworklist').removeClass('active').addClass('hide');
            $('#'+tagid).addClass('active').removeClass('hide');
            if(tagid == "tabActive")
            {

                listingDataActive();
            }
            else
            { 
                listingDataArchive();
            }
        });

        $('#receipt-email').on('keyup', function(){
            $('#invalid_email').hide();            
        });



        /* tabs functionality end */
        
        /* Active listing start */ 
        function listingDataActive()
        {
            var urlParams = new URLSearchParams(window.location.search);
            var listing_url = $('.artwork_listing_data_url').val();
            var delete_url = $('.delete_artwork_data_url').val();
            var edit_url = $('.edit_artwork_data_url').val();
            var restore_url = $('.restore_artwork_data_url').val();
            
            $.ajax({
                url: listing_url,
                type: 'POST',
                dataType: 'json',
                beforeSend: function () {
                    $(".main-loader").show();
                },
                complete: function (response) {
                   
                    var dataHtml = '';
                    var activeCount = [];
                    var activeArchive = [];
                    console.log(response.responseJSON);
                    if(response.responseJSON.isSuccess) {
                        if(response.responseJSON.artworklist) {                    
                            var artworkdata = response.responseJSON.artworklist; 
                            if(urlParams.has('sortby'))  
                            {
                                var sortby = urlParams.get('sortby');
                                 $("#sorter").val(sortby); 
                                if(sortby == 'quoteName')
                                {
                                    var data = artworkdata.sort(quoteSort("quoteName"));
                                }
                                else
                                {
                                   var data=  artworkdata.sort(function(a, b){           
                                    return new Date(b.createdDate) - new Date(a.createdDate); 
                                    });
                                }
                            }
                            else
                            {
                                var data=  artworkdata.sort(function(a, b){           
                                    return new Date(b.createdDate) - new Date(a.createdDate); 
                                    });
                            }                    
                                                    
                             $.each(data, function (i, item) {                               
                                var date = item.createdDate.split('T');
                                var dateFirstPart= date[0];
                                var cDate = dateFirstPart.split('-');
                                var createdDate = cDate[1]+'-'+cDate[2]+'-'+cDate[0];
                                var artHeight = item.artHeight+'"';
                                var artWidth = item.artWidth+'"';
                                var artDimension = artHeight+'X'+artWidth;
                                var artFinishHeight = Math.round((item.finalArtHeight/15))+'"';
                                var artFinishWidth =Math.round((item.finalArtWidth/15))+'"';
                                var artFinishDimension = artFinishHeight+'X'+artFinishWidth;
                                
                                if(item.isDeleted == false)
                                {
                                     activeCount.push(item.quoteId);
                                }
                                else if(item.isDeleted == true)
                                {
                                    activeArchive.push(item.quoteId);
                                }

                                if(item.isDeleted == false)
                                {
                                    dataHtml += '<li class="item">';
                                    dataHtml += '<div class="inner">';
                                    dataHtml += '<div class="tile-image">';
                                    dataHtml += '<img src="'+item.artworkFinalImage+'" alt="">';
                                    dataHtml += '</div>';

                                    dataHtml += '<div class="tile_content">';
                                    dataHtml += "<h5 class='banner-title'>"+item.quoteName+"</h5><p><span>Date: </span>"+createdDate+"</p><input type='hidden' class='art-dimension' value='"+artDimension+"'/><input type='hidden' class='art-finish-dimension' value='"+artFinishDimension+"'/><input type='hidden' class='artImage' value='"+item.artworkFinalImage+"'/>";
                                    dataHtml += '<a href="#" class="action-print" id="'+item.quoteId+'" data-action="share-art"><i class="fa fa-envelope" aria-hidden="true"></i>Share via Email</a>';
                                    dataHtml += '<div class="buttons">';
                                    if(item.fillet1Sku != '0' || item.fillet3Sku != '0'  || item.fillet5Sku != '0' || item.frame1Sku != '0' || item.frame2Sku != '0' || item.frame3Sku != '0' || item.mat1Sku != '0' || item.mat2Sku != '0' || item.mat3Sku != '0'){
                                    dataHtml += '<a target="_blank" href="" class="action primary artwork_addtocart" title="" data-attr="'+item.quoteId+'">Add To cart</a>';    
                                    }
                                    else
                                    {
                                    dataHtml += '<a target="_blank" href="" class="action primary artwork_addtocart disabled" title="" data-attr="'+item.quoteId+'">Add To cart</a>'; 
                                    }
                                    dataHtml += '<a target="_blank" href="'+edit_url+'?quoteguid='+item.quoteId+'" class="action primary " title="" data-action="edit-art"><i class="fa fa-pencil" aria-hidden="true"></i></a><a href="'+delete_url+'?quoteguid='+item.quoteId+'" class="action secondary delete" title="" data-action="delete-art"><i class="fa fa-archive" aria-hidden="true"></i></a>';
                                    dataHtml += '</div>';
                                    dataHtml += '</div>';

                                    dataHtml += '</div>';
                                    dataHtml += '</li>';
                                }
                                
                            });
                            $(".active_count").html("("+activeCount.length+")");
                            $(".archive_count").html("("+activeArchive.length+")");

                            
                            if(activeCount.length > 0)
                            {
                                $(".save-quote-list.active").html("");
                                $(".save-quote-list.active").append(dataHtml); 
                                itemPagination();
                                $('.toolbar-products.artwork-sortby .top-filter').show();
                            }
                            else
                            {
                                $(".save-quote-list.active").html("");
                                $(".save-quote-list.active").append("No record found.");
                                $('.toolbar-products.artwork-sortby .top-filter').hide();
                            }

                        }
                        
                    }
                    else
                    {
                        jQuery(".save-quote-list.active").html("");
                          jQuery(".save-quote-list.active").append(response.responseJSON.record_not_found);
                    }
                  
                    
                    $(".main-loader").hide();
                },
                error: function () {
                    console.log('Error. Try again.');
                }
            });
        }

    /* Active listing End */ 

     /* Archive listing start */ 
        function listingDataArchive()
        {
            var urlParams = new URLSearchParams(window.location.search);
            var listing_url = $('.artwork_listing_data_url').val();
            var delete_url = $('.delete_artwork_data_url').val();
            var edit_url = $('.edit_artwork_data_url').val();
            var restore_url = $('.restore_artwork_data_url').val();
            var pdelete_url= $('.remove_artwork_data_url').val();
            
            $.ajax({
                url: listing_url,
                type: 'POST',
                dataType: 'json',
                beforeSend: function () {
                    $(".main-loader").show();
                },
                complete: function (response) {
                    var dataHtmlArchive = '';
                    var activeCount = [];
                    var activeArchive = [];
                    console.log(response.responseJSON);
                    if(response.responseJSON.isSuccess) {
                        if(response.responseJSON.artworklist) {                    
                            var artworkdata = response.responseJSON.artworklist; 
                            if(urlParams.has('sortby'))  
                            {
                                var sortby = urlParams.get('sortby');
                                 $("#sorter").val(sortby); 
                                if(sortby == 'quoteName')
                                {
                                    var data = artworkdata.sort(quoteSort("quoteName"));
                                }
                                else
                                {
                                   var data=  artworkdata.sort(function(a, b){           
                                    return new Date(b.createdDate) - new Date(a.createdDate); 
                                    });
                                }
                            }
                            else
                            {
                                var data=  artworkdata.sort(function(a, b){           
                                    return new Date(b.createdDate) - new Date(a.createdDate); 
                                    });
                            }                    
                                                    
                             $.each(data, function (i, item) {
                                var date = item.createdDate.split('T');
                                var dateFirstPart= date[0];
                                var cDate = dateFirstPart.split('-');
                                var createdDate = cDate[1]+'-'+cDate[2]+'-'+cDate[0];
                                var artHeight = item.artHeight+'"';
                                var artWidth = item.artWidth+'"';
                                var artDimension = artHeight+'X'+artWidth;
                                var artFinishHeight = Math.round((item.finalArtHeight/15))+'"';
                                var artFinishWidth =Math.round((item.finalArtWidth/15))+'"';
                                var artFinishDimension = artFinishHeight+'X'+artFinishWidth;
                                if(item.isDeleted == false)
                                {
                                     activeCount.push(item.quoteId);
                                }
                                else if(item.isDeleted == true)
                                {
                                    activeArchive.push(item.quoteId);
                                }
                               if(item.isDeleted == true)
                                {
                                    dataHtmlArchive += '<li class="item">';
                                    dataHtmlArchive += '<div class="inner">';
                                    dataHtmlArchive += '<div class="tile-image">';
                                    dataHtmlArchive += '<img src="'+item.artworkFinalImage+'" alt="">';
                                    dataHtmlArchive += '</div>';

                                    dataHtmlArchive += '<div class="tile_content">';
                                    dataHtmlArchive += "<h5 class='banner-title'>"+item.quoteName+"</h5><p><span>Date: </span>"+createdDate+"</p><input type='hidden' class='art-dimension' value='"+artDimension+"'/><input type='hidden' class='art-finish-dimension' value='"+artFinishDimension+"'/><input type='hidden' class='artImage' value='"+item.artworkFinalImage+"'/>";
                                    dataHtmlArchive += '<div class="buttons"><a href="'+restore_url+'?quoteguid='+item.quoteId+'" class="action secondary restore" title="" data-action="restore-art">Restore</a><a href="'+pdelete_url+'?quoteguid='+item.quoteId+'" class="action secondary pdelete" title="" data-action="pdelete-art"><i class="fa fa-trash" aria-hidden="true"></i></a></div>';
                                    dataHtmlArchive += '</div>';

                                    dataHtmlArchive += '</div>';
                                    dataHtmlArchive += '</li>';
                                }
                            });
                            $(".active_count").html("("+activeCount.length+")");
                            $(".archive_count").html("("+activeArchive.length+")");
                            
                            if(activeArchive.length > 0)
                            {
                                jQuery(".save-quote-list.archived").html("");
                                jQuery(".save-quote-list.archived").append(dataHtmlArchive);
                                itemPaginationArchive();
                                $('.toolbar-products.artwork-sortby .top-filter').show();
                            }
                            else
                            {
                                jQuery(".save-quote-list.archived").html("");
                                jQuery(".save-quote-list.archived").append("No record found.");
                                $('.toolbar-products.artwork-sortby .top-filter').hide();
                            }
                            
                            
                           
                        }
                    }
                    else
                    {
                        jQuery(".save-quote-list.archived").html("");
                          jQuery(".save-quote-list.archived").append(response.responseJSON.record_not_found);
                    }
                  
                    
                    $(".main-loader").hide();
                },
                error: function () {
                    console.log('Error. Try again.');
                }
            });
        }

    /* Archive listing End */

    function quoteSort(property) {
        var sortOrder = 1; 
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            if(sortOrder == -1){
                return b[property].localeCompare(a[property]);
            }else{
                return a[property].localeCompare(b[property]);
            }        
        }
    }

    /* active item pagination start */

    function itemPagination()
    {

        
        $("div.pagination_divs").remove();

        var count_items = $(".itemsActive li").length;
        
        if(count_items > 9)
        {
            $(".pagination_wrapper_active").show();
        }
        else
        {
             $(".pagination_wrapper_active").hide();
        }

          // Keep a record of current page.
          var current_page = 1;

          // divide items by 10
          var separate_items = count_items / 9;

          // create empty variable
          var page_division = "";

          if (separate_items % 1 != 0) {
            page_division = separate_items + 1;
           
          } else {
            page_division = separate_items;
           
          }

          // iterate then generate links for each items pagination
          for (var items_pagination = 1; items_pagination < page_division; items_pagination++) {

            $(".pagination_active .insertbeforer").before("<div class='button pagination_divs page" + items_pagination + "'>" + items_pagination + "</div>");
          };

          // hide all items
          $('.itemsActive li').addClass('hideme');

          // display first 10 items
          $.each($('.itemsActive li'), function(index, value) {
            if (index <= 8) {
              $(this).toggleClass('hideme')
            }
          });
          $(".page1").addClass('current');

          // display items from 1-10
          $(".page1").click(function() {
            current_page = 1;
            $(".pagination_divs").removeClass('current');
            $(this).addClass('current');
            $('.itemsActive li').addClass('hideme');
            for (var item = 1; item < 10; item++) {
              $(".itemsActive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          // display items from 11-20
          $(".page2").click(function() {
            current_page = 2;
            $(".pagination_divs").removeClass('current');
            $(this).addClass('current');
            $('.itemsActive li').addClass('hideme');
            for (var item = 10; item < 19; item++) {
              $(".itemsActive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          // display items from 21-30
          $(".page3").click(function() {
            current_page = 3;
            $(".pagination_divs").removeClass('current');
            $(this).addClass('current');
            $('.itemsActive li').addClass('hideme');
            for (var item = 19; item < 28; item++) {
              $(".itemsActive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          // display items from 31-33
          $(".page4").click(function() {
            current_page = 4;
            $(".pagination_divs").removeClass('current');
            $(this).addClass('current');
            $('.itemsActive li').addClass('hideme');
            for (var item = 28; item < 37; item++) {
              $(".itemsActive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          $('.next').click(function() {
            //count_items=total
            if ((current_page) * 9 >= count_items) {
              return;
            }
            $('.itemsActive li').addClass('hideme');

            for (var item = ((current_page) * 9 + 1); item < ((current_page + 1) * 9 + 1); item++) {
              $(".itemsActive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
            current_page += 1;
          })
          $('.previous').click(function() {
           
            
            if (current_page == 1) {
              return;
            }
            $('.itemsActive li').addClass('hideme');
            current_page -= 1;
            for (var item = ((current_page - 1) * 9 + 1); item < ((current_page) * 9 + 1); item++) {
              $(".itemsActive li:nth-of-type(" + item + ")").removeClass('hideme');
            };

          })
    }

    /* active item pagination end */


    /* archived item pagination start */

    function itemPaginationArchive()
    {
        
        $("div.pagination_divs_archive").remove();
        var count_items = $(".itemsArchive li").length;
        //console.log(count_items);
        if(count_items > 9)
        {
            $(".pagination_wrapper_archive").show();
        }
        else
        {
             $(".pagination_wrapper_archive").hide();
        }

          // Keep a record of current page.
          var current_page = 1;

          // divide items by 10
          var separate_items = count_items / 9;
        
          // create empty variable
          var page_division = "";

          if (separate_items % 1 != 0) {
            page_division = separate_items + 1;
          } else {
            page_division = separate_items;
          }

          // iterate then generate links for each items pagination
          for (var items_pagination = 1; items_pagination < page_division; items_pagination++) {

            $(".pagination_archive .insertbeforer").before("<div class='button pagination_divs_archive page" + items_pagination + "'>" + items_pagination + "</div>");
          };

          // hide all items
          $('.itemsArchive li').addClass('hideme');

          // display first 10 items
          $.each($('.itemsArchive li'), function(index, value) {
            if (index <= 8) {
              $(this).toggleClass('hideme')
            }
          });
          $(".page1").addClass('current');
          // display items from 1-10
          $(".page1").click(function() {
            current_page = 1;
            $(".pagination_divs_archive").removeClass('current');
            $(this).addClass('current');
            $('.itemsArchive li').addClass('hideme');
            for (var item = 1; item < 10; item++) {
              $(".itemsArchive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          // display items from 11-20
          $(".page2").click(function() {
            current_page = 2;
            $(".pagination_divs_archive").removeClass('current');
            $(this).addClass('current');
            $('.itemsArchive li').addClass('hideme');
            for (var item = 10; item < 19; item++) {
              $(".itemsArchive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          // display items from 21-30
          $(".page3").click(function() {
            current_page = 3;
            $(".pagination_divs_archive").removeClass('current');
            $(this).addClass('current');
            $('.itemsArchive li').addClass('hideme');
            for (var item = 19; item < 28; item++) {
              $(".itemsArchive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          // display items from 31-33
          $(".page4").click(function() {
            current_page = 4;
            $(".pagination_divs_archive").removeClass('current');
            $(this).addClass('current');
            $('.itemsArchive li').addClass('hideme');
            for (var item = 28; item < 37; item++) {
              $(".itemsArchive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
          });
          $('.next').click(function() {
            //count_items=total
            if ((current_page) * 9 >= count_items) {
              return;
            }
            $('.itemsArchive li').addClass('hideme');

            for (var item = ((current_page) * 9 + 1); item < ((current_page + 1) * 9 + 1); item++) {
              $(".itemsArchive li:nth-of-type(" + item + ")").removeClass('hideme');
            };
            current_page += 1;
          })
          $('.previous').click(function() {
           
            
            if (current_page == 1) {
              return;
            }
            $('.itemsArchive li').addClass('hideme');
            current_page -= 1;
            for (var item = ((current_page - 1) * 9 + 1); item < ((current_page) * 9 + 1); item++) {
              $(".itemsArchive li:nth-of-type(" + item + ")").removeClass('hideme');
            };

          })
    }

    /* archived item pagination end */

        
        /* share atrwork start */
        jQuery(document).on('click','a[data-action="share-art"]', function(event){     
        event.preventDefault(); 
        localStorage.setItem('current_design_tab','tabActive');
        $("#receipt-email").val('');
        $('#invalid_email').hide(); 
        $("textarea[name='comment']").val('');      
        var shareUrl = $('.share_artwork_data_url').val();
        var quoteId = $(this).attr('id');
        var addtocart_url = $(".addtocart_artwork_data_url").val();
        var artname= $(this).siblings(".banner-title").html();
        var artfinishdimension= $(this).siblings(".art-finish-dimension").val();
        var artdimension= $(this).siblings(".art-dimension").val();
        var glazingSku= $(this).siblings(".glazingSku").val();
        var glazingName= $(this).siblings(".glazingName").val(); 
        var artimage =   $(this).siblings(".artImage").val(); 
        $.ajax({
                url: addtocart_url,
                type: 'POST',
                data : {quoteId:quoteId},
                dataType: 'json',
                beforeSend: function () {
                    $(".main-loader").show();
                },
                complete: function (response) {
                    console.log(response.responseJSON);
                    if(response.responseJSON) {
                     if(response.responseJSON.IsShare) {
                        if(response.responseJSON.productdata) { 
                            var quoteData = response.responseJSON.productdata; 
                            getShare(shareUrl, quoteData, artname, artfinishdimension, artdimension, glazingSku, glazingName, artimage);
                            $(".main-loader").hide();

                        }
                        else
                        {
                            var quoteData = ""; 
                            getShare(shareUrl, quoteData, artname, artfinishdimension, artdimension, glazingSku, glazingName, artimage);
                            $(".main-loader").hide();
                        }
                    }
                    else{
                        
                        $('.artwork_error_message').show();
                        $('.artwork_error_message').html(response.responseJSON.record_not_found);
                        setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                        $(".main-loader").hide();
                        return false;
                    }
                }
                else
                {
                    
                    $('.artwork_error_message').show();
                    $('.artwork_error_message').html("Ooops, something is wrong! We're currently unable to process the request.");
                    setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                    $(".main-loader").hide();
                    return false;
                }
            },
        });
        

        });

        /* share atrwork end */
        function getShare(shareUrl,quoteData,artname, artfinishdimension, artdimension, glazingSku, glazingName, artimage)
        {

            var options = {
            type: 'popup',
            responsive: true,
            innerScroll: true,
            title:'Share via Email',
            buttons: [{
                text: $.mage.__('Send'),
                class: 'action primary confirm',
                click: function () {
                    var email = $('#receipt-email').val();
                    if (email !== '')
                    {
                        if(IsEmail(email)==false)
                        {
                            $('#invalid_email').show();
                            return false;
                        }
                        else
                        {
                            $('#invalid_email').hide();
                        }
                    }
                    else
                    {
                        $('#invalid_email').show();
                        return false;
                    }
                    var form_data = jQuery("#share_artwork_form").serialize();
                    $(".main-loader").show();
                    jQuery.ajax({
                            url: shareUrl,
                            type: 'POST',
                            dataType: 'json',
                            data : {form_data: form_data,
                                quotedata:quoteData,
                                artname:artname,
                                artfinishdimension:artfinishdimension,
                                artdimension:artdimension,
                                glazingSku:glazingSku,
                                glazingName:glazingName,
                                artimage:artimage },
                            success: function(response){                                
                                console.log(response);
                                $("#receipt-email").val('');     
                                if(response.isSuccess)
                                {
                                   
                                    $('.artwork_success_message').show();
                                    $('.artwork_success_message').html(response.Message);
                                    setTimeout(function() { $(".artwork_success_message").fadeOut(1500); }, 5000);
                                }
                                else
                                {
                                    
                                    $('.artwork_error_message').show();
                                    $('.artwork_error_message').html(response.Message);
                                    setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                                }
                                $(".main-loader").hide();
                            },
                            error: function(result){
                                $('.artwork_error_message').show();
                                 $('.artwork_error_message').html("Ooops, something is wrong! We're currently unable to process the request.");
                                setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                                $(".main-loader").hide();
                            }
                        });

                    this.closeModal();
                }
            },
            {
                text: $.mage.__('Cancel'),
                class: 'action secondary cancel',
                click: function () {
                    $("#receipt-email").val('');     
                    this.closeModal();
                }
            }]

        };

        var popup = modal(options, $('#designstudio_artwork_share'));
        $("#designstudio_artwork_share").modal("openModal");
        $('#receipt-email').focus();
        }


        /* delete atrwork start */
        jQuery(document).on('click','a[data-action="delete-art"]', function(event){     
        event.preventDefault();
        var deleteUrl = $(this).attr('href');
        localStorage.setItem('current_design_tab','tabActive');
        var options = {
            type: 'popup',
            responsive: true,
            innerScroll: true,
            title:'Archive Design',
            buttons: [{
                text: $.mage.__('Archive'),
                class: 'action primary confirm',
                click: function () {
                    window.location.href = deleteUrl;
                    this.closeModal();
                }
            },
            {
                text: $.mage.__('Cancel'),
                class: 'action secondary cancel',
                click: function () {
                    this.closeModal();
                }
            }]

        };

        var popup = modal(options, $('#designstudio-modal'));
        $("#designstudio-modal").modal("openModal");

        });

        /* delete atrwork end */

        /* remove atrwork start */
        jQuery(document).on('click','a[data-action="pdelete-art"]', function(event){     
        event.preventDefault();
        var pdeleteUrl = $(this).attr('href');
        localStorage.setItem('current_design_tab','tabArchive');
        var options = {
            type: 'popup',
            responsive: true,
            innerScroll: true,
            title:'Delete Design',
            buttons: [{
                text: $.mage.__('Delete'),
                class: 'action primary confirm',
                click: function () {
                    window.location.href = pdeleteUrl;
                    this.closeModal();
                }
            },
            {
                text: $.mage.__('Cancel'),
                class: 'action secondary cancel',
                click: function () {
                    this.closeModal();
                }
            }]

        };

        var popup = modal(options, $('#designstudio-modal-remove'));
        $("#designstudio-modal-remove").modal("openModal");

        });

        /* remove atrwork end */


        /* edit atrwork start */
        jQuery(document).on('click','a[data-action="edit-art"]', function(event){     
        event.preventDefault();
        var editUrl = $(this).attr('href');
        
        var options = {
            type: 'popup',
            responsive: true,
            innerScroll: true,
            title:'Edit Design',
            buttons: [{
                text: $.mage.__('Edit'),
                class: 'action primary confirm',
                click: function () {
                    window.location.href = editUrl;
                    this.closeModal();
                }
            },
            {
                text: $.mage.__('Cancel'),
                class: 'action secondary cancel',
                click: function () {
                    this.closeModal();
                }
            }]

        };

        var popup = modal(options, $('#designstudio-modal-edit'));
        $("#designstudio-modal-edit").modal("openModal");

        });

        /* edit atrwork end */

        /* restore atrwork start */
        jQuery(document).on('click','a[data-action="restore-art"]', function(event){     
        event.preventDefault();
        var deleteUrl = $(this).attr('href');
        localStorage.setItem('current_design_tab','tabArchive');
        var options = {
            type: 'popup',
            responsive: true,
            innerScroll: true,
            title:'Restore Design',
            buttons: [{
                text: $.mage.__('Restore'),
                class: 'action primary confirm',
                click: function () {
                    window.location.href = deleteUrl;
                    this.closeModal();
                }
            },
            {
                text: $.mage.__('Cancel'),
                class: 'action secondary cancel',
                click: function () {
                    this.closeModal();
                }
            }]

        };

        var popup = modal(options, $('#designstudio-modal-restore'));
        $("#designstudio-modal-restore").modal("openModal");

        });

        /* restore atrwork end */

        /* start sort by */

        jQuery(document).on('change','.artwork-sortby .sorter-options', function(event){ 
             var sortby = jQuery(this).val();
             
              if (history.pushState) {
              var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?sortby='+sortby;
              window.history.pushState({path:newurl},'',newurl);
          }

            var listing_url = $('.artwork_listing_data_url').val();
            var delete_url = $('.delete_artwork_data_url').val();
            var restore_url = $('.restore_artwork_data_url').val();
            var edit_url = $('.edit_artwork_data_url').val();
            var pdelete_url = $('.remove_artwork_data_url').val();
            
            $.ajax({
                url: listing_url,
                type: 'POST',
                dataType: 'json',
                beforeSend: function () {
                    $(".main-loader").show();
                },
                complete: function (response) {
                    var dataHtml = '';
                    if (response.responseJSON.isSuccess && response.responseJSON.artworklist) {
                        var artworkdata = response.responseJSON.artworklist;
                        if(sortby == 'quoteName'){
                             var artworkdata = artworkdata.sort(quoteSort("quoteName"));

                        }
                        else
                        {
                            artworkdata.sort(function(a, b){           
                            return new Date(b.createdDate) - new Date(a.createdDate); 
                            }); 
                        }
                        var dataHtml='';
                        var dataHtmlArchive = '';
                        jQuery(".save-quote-list").html('');
                         $.each(artworkdata, function (i, item) {
                            var date = item.createdDate.split('T');
                            var dateFirstPart= date[0];
                            var cDate = dateFirstPart.split('-');
                            var createdDate = cDate[1]+'-'+cDate[2]+'-'+cDate[0];
                            var artHeight = item.artHeight+'"';
                            var artWidth = item.artWidth+'"';
                            var artDimension = artHeight+'X'+artWidth;
                            var artFinishHeight = Math.round((item.finalArtHeight/15))+'"';
                            var artFinishWidth =Math.round((item.finalArtWidth/15))+'"';
                            var artFinishDimension = artFinishHeight+'X'+artFinishWidth;
                            if(item.isDeleted == false)
                                {
                                    dataHtml += '<li class="item">';
                                    dataHtml += '<div class="inner">';
                                    dataHtml += '<div class="tile-image">';
                                    dataHtml += '<img src="'+item.artworkFinalImage+'" alt="">';
                                    dataHtml += '</div>';

                                    dataHtml += '<div class="tile_content">';
                                    dataHtml += "<h5 class='banner-title'>"+item.quoteName+"</h5><p><span>Date: </span>"+createdDate+"</p><input type='hidden' class='art-dimension' value='"+artDimension+"'/><input type='hidden' class='art-finish-dimension' value='"+artFinishDimension+"'/><input type='hidden' class='artImage' value='"+item.artworkFinalImage+"'/>";
                                    dataHtml += '<a href="#" class="action-print" id="'+item.quoteId+'" data-action="share-art"><i class="fa fa-envelope" aria-hidden="true"></i>Share via Email</a>';
                                    dataHtml += '<div class="buttons">';
                                    if(item.fillet1Sku != '0' || item.fillet3Sku != '0'  || item.fillet5Sku != '0' || item.frame1Sku != '0' || item.frame2Sku != '0' || item.frame3Sku != '0' || item.mat1Sku != '0' || item.mat2Sku != '0' || item.mat3Sku != '0'){
                                    dataHtml += '<a target="_blank" href="" class="action primary artwork_addtocart" title="" data-attr="'+item.quoteId+'">Add To cart</a>';    
                                    }
                                    else
                                    {
                                    dataHtml += '<a target="_blank" href="" class="action primary artwork_addtocart disabled" title="" data-attr="'+item.quoteId+'">Add To cart</a>'; 
                                    }
                                    dataHtml += '<a target="_blank" href="'+edit_url+'?quoteguid='+item.quoteId+'" class="action primary " title="" data-action="edit-art"><i class="fa fa-pencil" aria-hidden="true"></i></a><a href="'+delete_url+'?quoteguid='+item.quoteId+'" class="action secondary delete" title="" data-action="delete-art"><i class="fa fa-archive" aria-hidden="true"></i></a>';
                                    dataHtml += '</div>';
                                    dataHtml += '</div>';

                                    dataHtml += '</div>';
                                    dataHtml += '</li>';
                                }
                                else if(item.isDeleted == true)
                                {
                                    dataHtmlArchive += '<li class="item">';
                                    dataHtmlArchive += '<div class="inner">';
                                    dataHtmlArchive += '<div class="tile-image">';
                                    dataHtmlArchive += '<img src="'+item.artworkFinalImage+'" alt="">';
                                    dataHtmlArchive += '</div>';

                                    dataHtmlArchive += '<div class="tile_content">';
                                    dataHtmlArchive += "<h5 class='banner-title'>"+item.quoteName+"</h5><p><span>Date: </span>"+createdDate+"</p><input type='hidden' class='art-dimension' value='"+artDimension+"'/><input type='hidden' class='art-finish-dimension' value='"+artFinishDimension+"'/><input type='hidden' class='glazingSku' value='"+item.glazingSku+"'/><input type='hidden' class='glazingName' value='"+item.glazingName+"'/><input type='hidden' class='artImage' value='"+item.artworkFinalImage+"'/>";
                                    dataHtmlArchive += '<div class="buttons"><a href="'+restore_url+'?quoteguid='+item.quoteId+'" class="action secondary restore" title="" data-action="restore-art">Restore</a><a href="'+pdelete_url+'?quoteguid='+item.quoteId+'" class="action secondary pdelete" title="" data-action="pdelete-art"><i class="fa fa-trash" aria-hidden="true"></i></a></div>';
                                    dataHtmlArchive += '</div>';

                                    dataHtmlArchive += '</div>';
                                    dataHtmlArchive += '</li>';
                                }
                            
                        });
                        jQuery(".save-quote-list.active").html("");
                        jQuery(".save-quote-list.active").append(dataHtml); 
                        itemPagination();
                        jQuery(".save-quote-list.archived").html("");
                        jQuery(".save-quote-list.archived").append(dataHtmlArchive);
                        itemPaginationArchive();
                        $('.toolbar-products.artwork-sortby .top-filter').show();
                    }
                    else
                    {
                    jQuery(".save-quote-list.archived").html("");
                    jQuery(".save-quote-list.active").html("");
                    jQuery(".save-quote-list.active").append(response.responseJSON.record_not_found);
                    jQuery(".save-quote-list.archived").append(response.responseJSON.record_not_found);   
                    }
                    
                    $(".main-loader").hide();
                },
                error: function () {
                    console.log('Error. Try again.');
                }
            });

        });

        /* end  sort by*/

        /* back button start*/

         jQuery(document).on('click','.back-home a', function(event){
            // $('.artwork_error_message').css("display","none");
            // $('.artwork-sortby').show();
            // $('.design_studio_artwork_container').show();
            // $('.back-home').hide();
            // $('.desing-list').hide();
            // return false;

            location.reload();
         });


         /* back button end*/

         function IsEmail(email)
        {
            var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if(!regex.test(email)) {
                return false;
            }else{
                return true;
            }
        }



        /* add to cart start */

        jQuery(document).on('click','.artwork_addtocart', function(event){
        
        localStorage.setItem('current_design_tab','tabActive');     
            var addtocart_url = $(".addtocart_artwork_data_url").val();
            var quoteId = $(this).attr("data-attr");
            var artname= $(this).parent().siblings(".banner-title").html();
            var artfinishdimension= $(this).parent().siblings(".art-finish-dimension").val();
            var artdimension= $(this).parent().siblings(".art-dimension").val();             
            var artimage =   $(this).parent().siblings(".artImage").val(); 
            var isDisItem = "The Item has been discontinued and so no longer available to order.";  
            
            $.ajax({
                url: addtocart_url,
                type: 'POST',
                data : {quoteId:quoteId},
                dataType: 'json',
                beforeSend: function () {
                    $(".main-loader").show();
                },
                complete: function (response) {
                    console.log(response.responseJSON);
                    if(response.responseJSON) {
                        if(!response.responseJSON.IsAddToCart)
                        { 
                            console.log("one");

                            $('.artwork_error_message').html("We are unable to process the cart");
                            $('.artwork_error_message').show();
                            $("#cartconfirmation").css("display","none");
                        }
                        if(response.responseJSON.isSuccess) {
                        if(!response.responseJSON.IsAddToCart)
                        { 
                             console.log("two");
                            $('.artwork_error_message').html("We are unable to process the cart");
                            $('.artwork_error_message').show();
                            $("#cartconfirmation").css("display","none");
                        }
                        if(response.responseJSON.productdata) { 
                            var data = response.responseJSON.productdata; 
                            
                            $('.toolbar-products.artwork-sortby').hide();
                            $(".pagination_wrapper_active").hide();
                            $('.design_studio_artwork_container').hide();
                            $('.back-home').show();
                            $('.desing-list').show();
                            $('.detail-row .art_name').html(artname);
                            $('.detail-row .art_finished_dimension').html(artfinishdimension);
                            $('.detail-row .art_dimension').html(artdimension);
                            $('.art-container img').attr('src', artimage);
                            if(!data.glazing1)
                            {
                                $(".glazing").hide();
                            }
                            if(!data.frame3 && !data.frame2 && !data.frame1)
                            {
                                $(".frames").hide();
                            }
                            if(!data.mat1 && !data.mat2 && !data.mat3)
                            {
                                $(".mats").hide();
                            }
                            if(!data.fillet1 && !data.fillet3 && !data.fillet5)
                            {
                                $(".fillets").hide();
                            }
                            if(data.frame3)
                            {
                                $(".frame_inner_title").html('Inner');
                                $(".frame_inner_value").html('#'+data.frame3.Sku+','+data.frame3.Name);
                                
                                if(data.frame3.availablity)
                                {
                                    $("input[name='frame_inner']").closest(".check-option").show();
                                    $("input[name='frame_inner']").siblings("label.custom-control-label").css("display","block");
                                    $(".frame_inner").val(data.frame3.availablity.productId);
                                    if(data.frame3.availablity.isDisItem)
                                    {
                                        $(".frame_inner" ).prop("checked", false);
                                        $('.frame_inner').attr('disabled', true);
                                        $(".frame_inner_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    }
                                    else
                                    {
                                        $('.frame_inner').attr('checked', true);
                                        $(".frame_inner_uom").val(data.frame3.Uom);
                                        $(".frame_inner_price").val(data.frame3.availablity.price);
                                        $(".frame_inner_width").val(data.frame3.Width);
                                        $(".frame_inner_height").val(data.frame3.Height);
                                    } 
                                }
                                
                                                                
                            }                           
                            if(data.frame1)
                            {
                                $(".frame_outer_title").html('Outer');
                                $(".frame_outer_value").html('#'+data.frame1.Sku+','+data.frame1.Name);
                                
                                if(data.frame1.availablity)
                                 {
                                    $("input[name='frame_outer']").closest(".check-option").show();
                                    $("input[name='frame_outer']").siblings("label.custom-control-label").css("display","block");
                                    $(".frame_outer").val(data.frame1.availablity.productId);
                                    if(data.frame1.availablity.isDisItem)
                                    {
                                        $(".frame_outer" ).prop("checked", false);
                                        $('.frame_outer').attr('disabled', true);
                                        $(".frame_outer_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.frame_outer').attr('checked', true);
                                        $(".frame_outer_uom").val(data.frame1.Uom);
                                        $(".frame_outer_price").val(data.frame1.availablity.price);
                                        $(".frame_outer_width").val(data.frame1.Width);
                                        $(".frame_outer_height").val(data.frame1.Height);
                                    }
                                 }
                                
                                
                                if(data.frame2)
                                {
                                    $(".frame_middle_title").html('Middle');
                                    $(".frame_middle_value").html('#'+data.frame2.Sku+','+data.frame2.Name);
                                    
                                    if(data.frame2.availablity)
                                    {
                                        $("input[name='frame_middle']").closest(".check-option").show();
                                        $("input[name='frame_middle']").siblings("label.custom-control-label").css("display","block");
                                        $(".frame_middle").val(data.frame2.availablity.productId);
                                        if(data.frame2.availablity.isDisItem)
                                        {
                                            $(".frame_middle" ).prop("checked", false);
                                            $('.frame_middle').attr('disabled', true);
                                            $(".frame_middle_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                        }
                                        else
                                        {
                                            $('.frame_middle').attr('checked', true);
                                            $(".frame_middle_uom").val(data.frame2.Uom);
                                            $(".frame_middle_price").val(data.frame2.availablity.price);
                                            $(".frame_middle_width").val(data.frame2.Width);
                                            $(".frame_middle_height").val(data.frame2.Height);                                        
                                        }
                                    }
                                    
                                    
                                }
                            }
                            else if(data.frame2)
                            {
                                $(".frame_outer_title").html('Outer');
                                $(".frame_outer_value").html('#'+data.frame2.Sku+','+data.frame2.Name);
                                
                                if(data.frame2.availablity)
                                 {
                                    $("input[name='frame_outer']").closest(".check-option").show();
                                    $("input[name='frame_outer']").siblings("label.custom-control-label").css("display","block");
                                    $(".frame_outer").val(data.frame2.availablity.productId);
                                    if(data.frame2.availablity.isDisItem)
                                    {
                                        $(".frame_outer" ).prop("checked", false);
                                        $('.frame_outer').attr('disabled', true);
                                        $(".frame_outer_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.frame_outer').attr('checked', true);
                                        $(".frame_outer_uom").val(data.frame2.Uom);
                                        $(".frame_outer_price").val(data.frame2.availablity.price);
                                        $(".frame_outer_width").val(data.frame2.Width);
                                        $(".frame_outer_height").val(data.frame2.Height);
                                    }
                                 }
                                
                                
                            }

                            if(data.mat1)
                            {
                                $(".mat_top_title").html('Top');
                                $(".mat_top_value").html('#'+data.mat1.Sku+','+data.mat1.Name);
                                
                                if(data.mat1.availablity)
                                {
                                    $("input[name='mat_top']").closest(".check-option").show();
                                    $("input[name='mat_top']").siblings("label.custom-control-label").css("display","block");
                                    $(".mat_top").val(data.mat1.availablity.productId);
                                    if(data.mat1.availablity.isDisItem)
                                    {
                                        $(".mat_top" ).prop("checked", false);
                                        $('.mat_top').attr('disabled', true);
                                        $(".mat_top_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.mat_top').attr('checked', true);
                                        $(".mat_top_uom").val(data.mat1.Uom);
                                        $(".mat_top_price").val(data.mat1.availablity.price);
                                        $(".mat_top_width").val(data.mat1.Width);
                                        $(".mat_top_height").val(data.mat1.Height);
                                    }
                                }
                                
                                
                            }                           
                            if(data.mat3)
                            {
                                $(".mat_bottom_title").html('Bottom');
                                $(".mat_bottom_value").html('#'+data.mat3.Sku+','+data.mat3.Name);
                                
                                if(data.mat3.availablity)
                                {
                                    $("input[name='mat_bottom']").closest(".check-option").show();
                                    $("input[name='mat_bottom']").siblings("label.custom-control-label").css("display","block");
                                    $(".mat_bottom").val(data.mat3.availablity.productId);
                                    if(data.mat3.availablity.isDisItem)
                                    {
                                        $(".mat_bottom" ).prop("checked", false);
                                        $('.mat_bottom').attr('disabled', true);
                                        $(".mat_bottom_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.mat_bottom').attr('checked', true);
                                        $(".mat_bottom_uom").val(data.mat3.Uom);
                                        $(".mat_bottom_price").val(data.mat3.availablity.price);
                                        $(".mat_bottom_width").val(data.mat3.Width);
                                        $(".mat_bottom_height").val(data.mat3.Height);
                                        
                                    }
                                }
                                
                                
                                if(data.mat2)
                                {
                                    $(".mat_middle_title").html('Middle');
                                    $(".mat_middle_value").html('#'+data.mat2.Sku+','+data.mat2.Name);
                                    
                                    if(data.mat2.availablity)
                                    {
                                        $("input[name='mat_middle']").closest(".check-option").show();
                                        $("input[name='mat_middle']").siblings("label.custom-control-label").css("display","block");
                                        $(".mat_middle").val(data.mat2.availablity.productId);
                                        if(data.mat2.availablity.isDisItem)
                                        {
                                            $(".mat_middle" ).prop("checked", false);
                                            $('.mat_middle').attr('disabled', true);
                                            $(".mat_middle_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                        
                                        }
                                        else
                                        {
                                            $('.mat_middle').attr('checked', true);
                                            $(".mat_middle_uom").val(data.mat2.Uom);
                                            $(".mat_middle_price").val(data.mat2.availablity.price);
                                            $(".mat_middle_width").val(data.mat2.Width);
                                            $(".mat_middle_height").val(data.mat2.Height);
                                        } 
                                    }
                                    
                                   

                                }
                            }
                            else if(data.mat2)
                            {
                                $(".mat_bottom_title").html('Bottom');
                                $(".mat_bottom_value").html('#'+data.mat2.Sku+','+data.mat2.Name);
                                
                                if(data.mat2.availablity)
                                {
                                    $("input[name='mat_bottom']").closest(".check-option").show();
                                    $("input[name='mat_bottom']").siblings("label.custom-control-label").css("display","block");
                                    $(".mat_bottom").val(data.mat2.availablity.productId);
                                    if(data.mat2.availablity.isDisItem)
                                    {
                                        $(".mat_bottom" ).prop("checked", false);
                                        $('.mat_bottom').attr('disabled', true);
                                        $(".mat_bottom_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.mat_bottom').attr('checked', true);
                                        $(".mat_bottom_uom").val(data.mat2.Uom);
                                        $(".mat_bottom_price").val(data.mat2.availablity.price);
                                        $(".mat_bottom_width").val(data.mat2.Width);
                                        $(".mat_bottom_height").val(data.mat2.Height);
                                    }
                                }
                                
                                
                            }
                            if(data.fillet1)
                            {
                                $(".fillet_top_title").html('Top');
                                $(".fillet_top_value").html('#'+data.fillet1.Sku+','+data.fillet1.Name);
                                
                                if(data.fillet1.availablity)
                                {
                                    $("input[name='fillet_top']").closest(".check-option").show();
                                    $("input[name='fillet_top']").siblings("label.custom-control-label").css("display","block");
                                    $(".fillet_top").val(data.fillet1.availablity.productId);
                                    if(data.fillet1.availablity.isDisItem)
                                    {
                                        $(".fillet_top" ).prop("checked", false);
                                        $('.fillet_top').attr('disabled', true);
                                        $(".fillet_top_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.fillet_top').attr('checked', true);
                                        $(".fillet_top_uom").val(data.fillet1.Uom);
                                        $(".fillet_top_price").val(data.fillet1.availablity.price);
                                        $(".fillet_top_width").val(data.fillet1.Width);
                                        $(".fillet_top_height").val(data.fillet1.Height);
                                    }
                                }
                                
                                
                            }                           
                            if(data.fillet5)
                            {
                                $(".fillet_bottom_title").html('Bottom');
                                $(".fillet_bottom_value").html('#'+data.fillet5.Sku+','+data.fillet5.Name);
                                
                                if(data.fillet5.availablity)
                                {
                                    $("input[name='fillet_bottom']").closest(".check-option").show();
                                    $("input[name='fillet_bottom']").siblings("label.custom-control-label").css("display","block");
                                    $(".fillet_bottom").val(data.fillet5.availablity.productId);
                                    if(data.fillet5.availablity.isDisItem)
                                    {
                                        $(".fillet_bottom" ).prop("checked", false);
                                        $('.fillet_bottom').attr('disabled', true);
                                        $(".fillet_bottom_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.fillet_bottom').attr('checked', true);
                                        $(".fillet_bottom_uom").val(data.fillet5.Uom);
                                        $(".fillet_bottom_price").val(data.fillet5.availablity.price);
                                        $(".fillet_bottom_width").val(data.fillet5.Width);
                                        $(".fillet_bottom_height").val(data.fillet5.Height);
                                    }
                                }
                                
                                
                                if(data.fillet3)
                                {
                                    $(".fillet_middle_title").html('Middle');
                                    $(".fillet_middle_value").html('#'+data.fillet3.Sku+','+data.fillet3.Name);
                                    
                                    if(data.fillet3.availablity)
                                    {
                                        $("input[name='fillet_middle']").closest(".check-option").show();
                                        $("input[name='fillet_middle']").siblings("label.custom-control-label").css("display","block");
                                        $(".fillet_middle").val(data.fillet3.availablity.productId);
                                        if(data.fillet3.availablity.isDisItem)
                                        {
                                            $(".fillet_middle" ).prop("checked", false);
                                            $('.fillet_middle').attr('disabled', true);
                                            $(".fillet_middle_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                        }
                                        else
                                        {
                                            $('.fillet_middle').attr('checked', true);
                                            $(".fillet_middle_uom").val(data.fillet3.Uom);
                                            $(".fillet_middle_price").val(data.fillet3.availablity.price);
                                            $(".fillet_middle_width").val(data.fillet3.Width);
                                            $(".fillet_middle_height").val(data.fillet3.Height);

                                        }
                                    }
                                    
                                    
                                }
                            }
                            else if(data.fillet3)
                            {
                                $(".fillet_bottom_title").html('Bottom');
                                $(".fillet_bottom_value").html('#'+data.fillet3.Sku+','+data.fillet3.Name);
                                
                                if(data.fillet3.availablity)
                                {
                                    $("input[name='fillet_bottom']").closest(".check-option").show();
                                    $("input[name='fillet_bottom']").siblings("label.custom-control-label").css("display","block");
                                    $(".fillet_bottom").val(data.fillet3.availablity.productId);
                                    if(data.fillet3.availablity.isDisItem)
                                    {
                                        $(".fillet_bottom" ).prop("checked", false);
                                        $('.fillet_bottom').attr('disabled', true);
                                        $(".fillet_bottom_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.fillet_bottom').attr('checked', true);
                                        $(".fillet_bottom_uom").val(data.fillet3.Uom);
                                        $(".fillet_bottom_price").val(data.fillet3.availablity.price);
                                        $(".fillet_bottom_width").val(data.fillet3.Width);
                                        $(".fillet_bottom_height").val(data.fillet3.Height);
                                    }
                                }
                                
                                
                            }
                            if(data.glazing1)
                            {
                                $(".glazing_top_title").html('Name');
                                $(".glazing_top_value").html('#'+data.glazing1.Sku+','+data.glazing1.Name);
                                
                                if(data.glazing1.availablity)
                                {
                                    $("input[name='glazing_top']").closest(".check-option").show();
                                    $("input[name='glazing_top']").siblings("label.custom-control-label").css("display","block");
                                    $(".glazing_top").val(data.glazing1.availablity.productId);
                                    if(data.glazing1.availablity.isDisItem)
                                    {
                                        $(".glazing_top" ).prop("checked", false);
                                        $('.glazing_top').attr('disabled', true);
                                        $(".glazing_top_value").after('<li class="error"><div class="mesg" >'+isDisItem+'</div></li>');
                                    
                                    }
                                    else
                                    {
                                        $('.glazing_top').attr('checked', true);
                                        $(".glazing_top_uom").val(data.glazing1.Uom);
                                        $(".glazing_top_price").val(data.glazing1.availablity.price);
                                        $(".glazing_top_width").val(data.glazing1.Width);
                                        $(".glazing_top_height").val(data.glazing1.Height);
                                    }
                                }
                                
                                
                            }  

                        }
                        else
                        {
                            $('.artwork_error_message').show();
                            $('.artwork_error_message').html("Ooops, something is wrong! We're currently unable to process the request.");
                            setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                        }
                    }
                    else
                    {
                        $('.artwork_error_message').show();
                        $('.artwork_error_message').html(response.responseJSON.record_not_found);
                        setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                    }
                }
                else
                        {
                            $('.artwork_error_message').show();
                            $('.artwork_error_message').html("Ooops, something is wrong! We're currently unable to process the request.");
                            setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                        }
                    $(".main-loader").hide();
                },
                error: function () {
                    console.log('Error. Try again.');
                }
            });
            return false;
        });


    $("#cartconfirmation").click(function(event){

        
        var url=$(".confirm_artwork_data_url").val();
        event.preventDefault();
        var products = [];
        // var searchIDs = $(".design-detail input:checkbox:checked").map(function(){
        //     return $(this).val();
        //      }).get();

        var checked = $(".middle input:checkbox:checked").length;

          if(!checked) {          
           
           $('.artwork_error_message').show();
            $('.artwork_error_message').html("You must check at least one Product.");
            setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
            return false;
          }

        $('.middle input:checkbox:checked').each(function(){
            var $t=$(this);
            var data = {};
            data.id = $(this).val();
            data.uom= $('.'+$t.attr('name')+'_uom').val();
            data.price= $('.'+$t.attr('name')+'_price').val();
            data.width= $('.'+$t.attr('name')+'_width').val();
            data.height= $('.'+$t.attr('name')+'_height').val();
            products.push(data);
          });

        var jsonString = JSON.stringify(products);
        
        jQuery.ajax({
            type: 'POST', 
            showLoader: true,
            url: url,
            data: {data : jsonString}, 
            beforeSend: function () {
                    $(".main-loader").show();
                },
            success: function (data) {
                console.log(data);
                if(data.isSuccess) 
                {
                    window.location.href = $(".cart_url").val();
                }
                else{
                    $('.artwork_error_message').show();
                     
                      $('.artwork_error_message').html(data.Message);
                    setTimeout(function() { $(".artwork_error_message").fadeOut(1500); }, 5000);
                }
                
                $(".main-loader").hide();
            },
            error: function (request, error)
            {
                console.log("Error");
            }
        });
        return false;

            });


    });
});
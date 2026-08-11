<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      $row = $result->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>

      <script>
        var vendorNames = [];
        var vendorsNotes = [];
        var vendorsIDs = [];
        var itemsNames = [];
        var itemsStock = [];
        var itemsBrands = [];
        var itemsIDs = [];
        var itemClicked;
        function calc(){
          if(document.getElementsByName('poType')[0].value == "Service"){
            let total = 0;
            for (let i=0;i<document.getElementsByName("servicePrice[]").length;i++){
              let price = parseFloat(document.getElementsByName("servicePrice[]")[i].value);
                if(!isNaN(price)){
                  let subtotal = Math.round(price*1000)/1000;
                  total = total + subtotal;
                  let vat = 0;
                  if(document.getElementsByName("currency")[0].value == "BHD" && document.getElementById("vatInput").value != "0"){
                    vat = Math.round(total*0.1*1000)/1000;
                  }
                  document.getElementById("currentTotalInput").value = total;
                  document.getElementById("vatInput").value = vat;
                  document.getElementById("grandTotalInput").value = Math.round((vat+total)*1000)/1000;
                }
            }
          }else{
            let total = 0;
            for (let i=0;i<document.getElementsByName("quantity[]").length;i++){
              let qty = parseInt(document.getElementsByName("quantity[]")[i].value);
              let price = parseFloat(document.getElementsByName("price[]")[i].value);
                if(!isNaN(qty*price)){
                  let subtotal = Math.round(qty*price*1000)/1000;
                  total = total + subtotal;
                  let vat = 0;
                  if(document.getElementsByName("currency")[0].value == "BHD" && document.getElementById("vatInput").value != "0"){
                    vat = Math.round(total*0.1*1000)/1000;
                  }
                  document.getElementById("currentTotalInput").value = total;
                  document.getElementById("vatInput").value = vat;
                  document.getElementById("grandTotalInput").value = Math.round((vat+total)*1000)/1000;
                }
            }
          }
        }
        function searchVendor(){
          document.getElementById("vendorsDiv").style.display = "block";
          document.getElementById('vendorPopup').style.display = "block";
          document.getElementById('vendorAddDiv').style.display = "none";
          document.getElementById('vendorLoading').style.display = "none";
          document.getElementById('addNewPopupBtn').style.display = "block";
          document.getElementById('searchPopupBtn').style.display = "none";
          document.getElementById("newVendorName").value = "";
          document.getElementById("newvendorNotes").value = "";
          document.getElementsByName('contactName')[0].value = "";
          document.getElementsByName('contactPositon')[0].value = "";
          document.getElementsByName('contactValue')[0].value = "";
        }
        function showVendorForm(){
          if(document.getElementById('vendorAddDiv').style.display != "block"){
            document.getElementById("moreContactDiv").innerHTML = "";
          }
          document.getElementById('vendorPopup').style.display = "none";
          document.getElementById('vendorLoading').style.display = "none";
          document.getElementById('vendorAddDiv').style.display = "block";
          document.getElementById('addNewPopupBtn').style.display = "none";
          document.getElementById('searchPopupBtn').style.display = "block";
        }
        function showSearchForm(){
          document.getElementById('vendorPopup').style.display = "block";
          document.getElementById('vendorLoading').style.display = "none";
          document.getElementById('vendorAddDiv').style.display = "none";
          document.getElementById('addNewPopupBtn').style.display = "block";
          document.getElementById('searchPopupBtn').style.display = "none";
        }
        function addMoreContact(){
          let contactType = [];
          let contactName = [];
          let contactPositon = [];
          let contactValue = [];
          for (let i=0;i<document.getElementsByName('contactType').length;i++){
            if(i != 0){
              contactType.push(document.getElementsByName('contactType')[i].value);
              contactName.push(document.getElementsByName('contactName')[i].value);
              contactPositon.push(document.getElementsByName('contactPositon')[i].value);
              contactValue.push(document.getElementsByName('contactValue')[i].value);
            }
          }
          document.getElementById("moreContactDiv").innerHTML=document.getElementById("moreContactDiv").innerHTML + `
          <div id="cn`+document.getElementsByName('contactType').length+`" class="w3-row w3-margin-top">
            <div class="w3-col m2">
              <select name="contactType" class="w3-select w3-padding w3-border" style="height:40px;">
                <option value="mobile">mobile</option>
                <option value="email">email</option>
                <option value="other">other</option>
              </select>
            </div>
            <div class="w3-col m3" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactPositon" maxlength="100" placeholder="position">
            </div>
            <div class="w3-col m3" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactName" maxlength="100" placeholder="name">
            </div>
            <div class="w3-col m3" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactValue" maxlength="100" placeholder="value">
            </div>
            <div class="w3-col m1 removebtns2" style="padding-left:5px;height:40px;">
              <a onclick='removeContact(`+document.getElementsByName('contactType').length+`)' class='w3-tag w3-red' style='cursor:pointer;height:22px;margin-top:9px;'>X</a>
            </div>
          </div>
          `;
          for (let i=0;i<document.getElementsByName('contactType').length - 1;i++){
            if(i != 0){
              document.getElementsByName('contactType')[i].value=contactType[i-1];
              document.getElementsByName('contactName')[i].value=contactName[i-1];
              document.getElementsByName('contactPositon')[i].value=contactPositon[i-1];
              document.getElementsByName('contactValue')[i].value=contactValue[i-1];
            }
          }
          for (var x=0;x<document.getElementsByClassName('removebtns2').length;x++){
            document.getElementsByClassName('removebtns2')[x].style.display = "none";
          }
          document.getElementsByClassName('removebtns2')[document.getElementsByClassName('removebtns2').length - 1].style.display = "inline-block";
        }
        function removeContact(index){
          document.getElementById("cn"+index).remove();
          for (var x=0;x<document.getElementsByClassName('removebtns2').length;x++){
            document.getElementsByClassName('removebtns2')[x].style.display = "none";
          }
          if(document.getElementsByClassName('removebtns2').length > 0){
            document.getElementsByClassName('removebtns2')[document.getElementsByClassName('removebtns2').length - 1].style.display = "inline-block";
          }
        }
        function addNewVendorSubmitted(){
          document.getElementById("vendorLoading").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
          if(document.getElementById('newVendorName').value.trim().length < 1){
            alert("Please fill vendor's name !");
          }else{
            let postData;
            postData = "name="+document.getElementById('newVendorName').value.trim();
            postData = postData + "&notes="+document.getElementById('newvendorNotes').value.trim();
            for (let i=0;i<document.getElementsByName('contactType').length;i++){
              if(document.getElementsByName('contactName')[i].value.trim().length > 0 && document.getElementsByName('contactValue')[i].value.trim().length > 0){
                postData = postData + "&contactType[]="+document.getElementsByName('contactType')[i].value.trim();
                postData = postData + "&contactName[]="+document.getElementsByName('contactName')[i].value.trim();
                postData = postData + "&contactPositon[]="+document.getElementsByName('contactPositon')[i].value.trim();
                postData = postData + "&contactValue[]="+document.getElementsByName('contactValue')[i].value.trim();
              }
            }
            postData = postData + "&user=<?php echo $row['id']; ?>";
            document.getElementById("vendorAddDiv").style.display = "none";
            document.getElementById("vendorLoading").style.display = "block";
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'addNewVendor.php', true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                if(xhr.responseText == "added"){
                  document.getElementById("vendorLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Added Successfully!</h3>";

                  var xhr2 = new XMLHttpRequest();
                  xhr2.open("POST", 'getVendors.php', true);
                  xhr2.onreadystatechange = function() {
                    if(xhr2.readyState == XMLHttpRequest.DONE && xhr2.status == 200){
                      var jsonObj = JSON.parse(xhr2.responseText);
                      vendorNames = [];
                      vendorsNotes = [];
                      vendorsIDs = [];
                      for (var x=0;x<jsonObj.length;x++){
                        vendorNames.push(jsonObj[x].name);
                        vendorsNotes.push(jsonObj[x].notes);
                        vendorsIDs.push(jsonObj[x].id);
                      }
                    }
                  }
                  xhr2.send();

                }else if(xhr.responseText == "alreadyAdded"){
                  document.getElementById("vendorLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed, Already Added</h3>";
                }else{
                  document.getElementById("vendorLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                }
              }
            }
            xhr.send(postData);
          }
        }
        function searchClicked(e) {
          if ((document.getElementById('searchInput').value.trim().length > 1)){
            document.getElementById("defaultSearch").style.display = "none";
            document.getElementById("resultSearchList").style.display = "block";
            document.getElementById("resultSearchList").innerHTML = "";
            for (var i=0;i<vendorNames.length;i++) {
              if (vendorNames[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase()) || vendorsNotes[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase())){
                document.getElementById("resultSearchList").innerHTML = document.getElementById("resultSearchList").innerHTML + "<li><div onclick='addVend("+i+")' class='w3-padding vendorResultElement' style='cursor:pointer;'><h6 style='margin:0px;color:#0b5266;'>"+vendorNames[i]+"</h6><p class='w3-text-grey' style='margin:0px;'><b>"+vendorsNotes[i]+"</b></p></li>";
              }
            }
          }else{
            document.getElementById("resultSearchList").innerHTML = "";
            document.getElementById("resultSearchList").style.display = "none";
            document.getElementById("defaultSearch").style.display = "block";
          }
        }
        function addVend(x){
          document.getElementById("vendorNameText").value = vendorNames[x];
          document.getElementById("vendorIDText").value = vendorsIDs[x];
          document.getElementById("vendorsDiv").style.display = "none";
        }
        function addMoreItems(){
          let itemName = [];
          let itemID = [];
          let qty = [];
          let price = [];
          let counter = document.getElementsByName('itemID[]').length;
          for (let i=0;i<counter;i++){
            if(i != 0){
              itemName.push(document.getElementsByName('itemName[]')[i].value);
              itemID.push(document.getElementsByName('itemID[]')[i].value);
              qty.push(document.getElementsByName('quantity[]')[i].value);
              price.push(document.getElementsByName('price[]')[i].value);
            }
          }
          document.getElementById("moreItemsDiv").innerHTML = document.getElementById("moreItemsDiv").innerHTML + `
          <div id="im`+counter+`" class="w3-half">
            <div class="w3-col m6 s12 w3-padding">
              <p>
                <label><b>Item #`+(counter+1)+`</b></label>
                <input id="itemInputsName`+counter+`" class="w3-input w3-border" type="text" name="itemName[]" disabled>
                <input id="itemInputsID`+counter+`" class="w3-input w3-border" style="opacity:0;width:0;" name="itemID[]" required>
              </p>
              <p>
                <a onclick="searchItem(`+counter+`)" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                <a onclick='removeItem(`+counter+`)' class="w3-btn w3-small w3-brown removebtns" style="background:#128cae;color:#fff;">X</a>
              </p>
            </div>
            <div class="w3-col m2 s12 w3-padding">
              <p>
                <label><b>Quantity #`+(counter+1)+`</b></label>
                <input onchange="calc()" onkeyup="calc()" id="qtyInput`+counter+`" class="w3-input w3-border" type="number" name="quantity[]" required>
              </p>
            </div>
            <div class="w3-col m4 s12 w3-padding">
              <p>
                <label><b>Price #`+(counter+1)+`</b></label>
                <input onkeydown="validateNumber(event)" onkeyup="calc()" id="priceInput`+counter+`" class="w3-input w3-border" type="text" name="price[]" required>
              </p>
            </div>
          </div>`;
          for (let i=0;i<counter;i++){
            if(i != 0){
              document.getElementsByName('itemName[]')[i].value=itemName[i-1];
              document.getElementsByName('itemID[]')[i].value=itemID[i-1];
              document.getElementsByName('quantity[]')[i].value=qty[i-1];
              document.getElementsByName('price[]')[i].value=price[i-1];
            }
          }
          for (var x=0;x<document.getElementsByClassName('removebtns').length;x++){
            document.getElementsByClassName('removebtns')[x].style.display = "none";
          }
          document.getElementsByClassName('removebtns')[document.getElementsByClassName('removebtns').length - 1].style.display = "inline-block";
        }
        function removeItem(index){
          document.getElementById("im"+index).remove();
          calc();
          for (var x=0;x<document.getElementsByClassName('removebtns').length;x++){
            document.getElementsByClassName('removebtns')[x].style.display = "none";
          }
          if((document.getElementsByClassName('removebtns').length) > 0){
            document.getElementsByClassName('removebtns')[document.getElementsByClassName('removebtns').length - 1].style.display = "inline-block";
          }
        }
        function searchItem(x){
          if(x == "main"){
            document.getElementById("itemsDiv").style.display = "block";
            document.getElementById('itemPopup').style.display = "none";
            document.getElementById('itemAddDiv').style.display = "block";
            document.getElementById('itemLoading').style.display = "none";
            document.getElementById('addNewItemPopupBtn').style.display = "none";
            document.getElementById('searchItemPopupBtn').style.display = "none";
            document.getElementById("newItemName").value = "";
            document.getElementById("newItemBrand").value = "";
            document.getElementById("newItemStock").value = "0";
            document.getElementById("newItemCategory").selectedIndex = 0;
          }else{
            document.getElementById("itemsDiv").style.display = "block";
            document.getElementById('itemPopup').style.display = "block";
            document.getElementById('itemAddDiv').style.display = "none";
            document.getElementById('itemLoading').style.display = "none";
            document.getElementById('addNewItemPopupBtn').style.display = "block";
            document.getElementById('searchItemPopupBtn').style.display = "none";
            document.getElementById("newItemName").value = "";
            document.getElementById("newItemBrand").value = "";
            document.getElementById("newItemStock").value = "0";
            document.getElementById("newItemCategory").selectedIndex = 0;
            itemClicked = x;
          }
        }
        function showItemForm(){
          document.getElementById('itemPopup').style.display = "none";
          document.getElementById('itemLoading').style.display = "none";
          document.getElementById('itemAddDiv').style.display = "block";
          document.getElementById('addNewItemPopupBtn').style.display = "none";
          document.getElementById('searchItemPopupBtn').style.display = "block";
        }
        function addNewItemSubmitted(){
          document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
          if(document.getElementById('newItemName').value.trim().length < 1){
            alert("Please fill item's name !");
          }else{
            let postData;
            postData = "name="+document.getElementById('newItemName').value.trim();
            postData = postData + "&brand="+document.getElementById('newItemBrand').value.trim();
            postData = postData + "&stock="+document.getElementById('newItemStock').value.trim();
            postData = postData + "&category="+document.getElementById('newItemCategory').value;
            postData = postData + "&user=<?php echo $row['id']; ?>";
            document.getElementById("itemAddDiv").style.display = "none";
            document.getElementById("itemLoading").style.display = "block";
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'addNewItem.php', true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                if(xhr.responseText == "added"){
                  document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Added Successfully!</h3>";

                  var xhr2 = new XMLHttpRequest();
                  xhr2.open("POST", 'getItems.php', true);
                  xhr2.onreadystatechange = function() {
                    if(xhr2.readyState == XMLHttpRequest.DONE && xhr2.status == 200){
                      var jsonObj = JSON.parse(xhr2.responseText);
                      itemsNames = [];
                      itemsBrands = [];
                      itemsIDs = [];
                      itemsStock = [];
                      for (var x=0;x<jsonObj.length;x++){
                        itemsNames.push(jsonObj[x].name);
                        itemsBrands.push(jsonObj[x].brand);
                        itemsIDs.push(jsonObj[x].id);
                        itemsStock.push(jsonObj[x].stock);
                      }
                    }
                  }
                  xhr2.send();
                }else if(xhr.responseText == "alreadyAdded"){
                  document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed, Already Added</h3>";
                }else{
                  document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                }
              }
            }
            xhr.send(postData);
          }
        }
        function searchClicked2(e) {
          if ((document.getElementById('searchInput2').value.trim().length > 1)){
            document.getElementById("defaultSearchItems").style.display = "none";
            document.getElementById("resultSearchListItems").style.display = "block";
            document.getElementById("resultSearchListItems").innerHTML = "";
            for (var i=0;i<itemsNames.length;i++) {
              if (itemsNames[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase()) || itemsBrands[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase())){
                document.getElementById("resultSearchListItems").innerHTML = document.getElementById("resultSearchListItems").innerHTML + "<li><div onclick='addItem("+i+")' class='w3-padding vendorResultElement' style='border-bottom:1px solid #e1e1e1;cursor:pointer;'><h6 style='margin:0px;color:#0b5266;'>"+itemsNames[i]+"</h6><p class='w3-text-grey' style='margin:0px;'><b>"+itemsBrands[i]+"</b></p></li>";
              }
            }
          }else{
            document.getElementById("resultSearchListItems").innerHTML = "";
            document.getElementById("resultSearchListItems").style.display = "none";
            document.getElementById("defaultSearchItems").style.display = "block";
          }
        }
        function addItem(x){
          document.getElementById("itemInputsName"+itemClicked).value = itemsNames[x];
          document.getElementById("itemInputsID"+itemClicked).value = itemsIDs[x];
          if(document.getElementById("itemAvailable"+itemClicked)){
            if(itemsStock[x]>0){
              document.getElementById("itemAvailable"+itemClicked).innerHTML = "<span class='w3-tag w3-green w3-round itemAvailableSpan'>"+itemsStock[x]+"</span>";
            }else{
              document.getElementById("itemAvailable"+itemClicked).innerHTML = "<span class='w3-tag w3-red w3-round itemAvailableSpan'>"+itemsStock[x]+"</span>";
            }
          }
          document.getElementById("itemsDiv").style.display = "none";
        }
        function showItemSearchForm(){
          document.getElementById('itemPopup').style.display = "block";
          document.getElementById('itemLoading').style.display = "none";
          document.getElementById('itemAddDiv').style.display = "none";
          document.getElementById('addNewItemPopupBtn').style.display = "block";
          document.getElementById('searchItemPopupBtn').style.display = "none";
        }
        function validateNumber(e){
          allowArray = [".","1","2","3","4","5","6","7","8","9","0","Delete","Backspace","ArrowLeft","ArrowRight"];
          if(!allowArray.includes(e.key)){
            e.preventDefault();
          }
        }
        function poTypeChanged(){
          document.getElementById("currentTotalInput").value = "";
          document.getElementById("vatInput").value = "";
          document.getElementById("grandTotalInput").value = "";
          if(document.getElementsByName('poType')[0].value == "Service"){
            document.getElementById("poItemsDiv").innerHTML =
            `<h4 class="w3-padding"><i>Service Details</i></h4>
            <div class="w3-row">
              <div class="w3-half">
                <div class="w3-col m6 s12 w3-padding">
                  <p>
                    <label><b>Service</b></label>
                    <input class="w3-input w3-border" type="text" name="serviceName[]" maxlength="100" required>
                  </p>
                </div>
                <div class="w3-col m4 s12 w3-padding">
                  <p>
                    <label><b>Price</b></label>
                    <input onkeydown="validateNumber(event)" onkeyup="calc()" class="w3-input w3-border" type="text" name="servicePrice[]" maxlength="50" required>
                  </p>
                </div>
              </div>
              <div id="moreSeviceDiv"></div>
              <div class="w3-col m12 s12 w3-padding" style="">
                <a class="w3-small" onclick="addMoreServices()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ add more services</a>
              </div>
            </div>`;
          }else{
            document.getElementById("poItemsDiv").innerHTML =
            `<h4 class="w3-padding"><i>Item Details</i></h4>
            <div class="w3-row">
              <div class="w3-half">
                <div class="w3-col m6 s12 w3-padding">
                  <p>
                    <label><b>Item</b></label>
                    <input id="itemInputsName0" class="w3-input w3-border" type="text" name="itemName[]" disabled>
                    <input id="itemInputsID0" class="w3-input w3-border" style="opacity:0;width:0;" name="itemID[]" required>
                  </p>
                  <p>
                    <a onclick="searchItem(0)" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                  </p>
                </div>
                <div class="w3-col m2 s12 w3-padding">
                  <p>
                    <label><b>Quantity</b></label>
                    <input onchange="calc()" onkeyup="calc()" id="qtyInput0" class="w3-input w3-border" type="number" name="quantity[]" required>
                  </p>
                </div>
                <div class="w3-col m4 s12 w3-padding">
                  <p>
                    <label><b>Price</b></label>
                    <input onkeydown="validateNumber(event)" onkeyup="calc()" id="priceInput0" class="w3-input w3-border" type="text" name="price[]" required>
                  </p>
                </div>
              </div>
              <div id="moreItemsDiv"></div>
              <div class="w3-col m12 s12 w3-padding" style="">
                <a class="w3-small" onclick="addMoreItems()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ add more items</a>
              </div>
            </div>`;
          }
        }
        function addMoreServices(){
          let serviceName = [];
          let servciePrice = [];
          let counter = document.getElementsByName('serviceName[]').length;
          for (let i=0;i<counter;i++){
            if(i != 0){
              serviceName.push(document.getElementsByName('serviceName[]')[i].value);
              servciePrice.push(document.getElementsByName('servicePrice[]')[i].value);
            }
          }
          document.getElementById("moreSeviceDiv").innerHTML = document.getElementById("moreSeviceDiv").innerHTML + `
          <div id="sv`+counter+`" class="w3-half">
            <div class="w3-col m6 s12 w3-padding">
              <p>
                <label><b>Service #`+(counter+1)+`</b></label>
                <input id="serviceInputName`+counter+`" class="w3-input w3-border" type="text" name="serviceName[]" maxlength="100" required>
              </p>
              <p>
                <a onclick='removeService(`+counter+`)' class="w3-btn w3-small w3-brown removebtns3" style="background:#128cae;color:#fff;">X</a>
              </p>
            </div>
            <div class="w3-col m4 s12 w3-padding">
              <p>
                <label><b>Price #`+(counter+1)+`</b></label>
                <input onkeydown="validateNumber(event)" onkeyup="calc()" id="servicePriceInput`+counter+`" class="w3-input w3-border" type="text" name="servicePrice[]" maxlength="50" required>
              </p>
            </div>
          </div>`;
          for (let i=0;i<counter;i++){
            if(i != 0){
              document.getElementsByName('serviceName[]')[i].value=serviceName[i-1];
              document.getElementsByName('servicePrice[]')[i].value=servciePrice[i-1];
            }
          }
          for (var x=0;x<document.getElementsByClassName('removebtns3').length;x++){
            document.getElementsByClassName('removebtns3')[x].style.display = "none";
          }
          document.getElementsByClassName('removebtns3')[document.getElementsByClassName('removebtns3').length - 1].style.display = "inline-block";
        }
        function removeService(index){
          document.getElementById("sv"+index).remove();
          calc();
          for (var x=0;x<document.getElementsByClassName('removebtns3').length;x++){
            document.getElementsByClassName('removebtns3')[x].style.display = "none";
          }
          if((document.getElementsByClassName('removebtns3').length) > 0){
            document.getElementsByClassName('removebtns3')[document.getElementsByClassName('removebtns3').length - 1].style.display = "inline-block";
          }
        }
      </script>

      <style>
        input,select,textarea{
          background: #f9f9f9 !important;
        }
        input:focus,select:focus,textarea:focus{
          background: #f7f1ef !important;
        }
        input[type=submit]{
          background:#0b5266 !important;
          color:#fff;
          width: 150px;
        }
        label{
          color:#0b5266;
        }
        h4{
          margin: 0 !important;
          background: #f7f1ef !important;
        }
        .vendorResultElement{
          transition: all 0.5s;
        }
        .vendorResultElement:hover{
          background: #f1f1f1 !important;
        }
      </style>

      <div class="w3-container w3-margin-top" style="padding-bottom:40px;">
        <div class="w3-margin-top w3-padding w3-light-grey" style="padding-bottom:40px !important;">
          <h1 class="w3-padding title">Add New Purchase / Service</h1>
          <form action="addPurchase.php" method="post">
            <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
            <div class="w3-row">
              <div class="w3-row w3-card-2 w3-white">
                <h4 class="w3-padding"><i>PO Details</i></h4>
                <div class="w3-col m3 s12 w3-padding">
                  <p>
                    <label><b>PO Type (Purchase/Sevice)</b></label>
                    <select onchange="poTypeChanged()" class="w3-select w3-padding w3-border" name="poType">
                      <option value="Purchase">Purchase</option>
                      <option value="Service">Service</option>
                    </select>
                  </p>
                </div>
                <div class="w3-col m3 s12 w3-padding">
                  <p>
                    <label><b>PO Number</b></label>
                    <input class="w3-input w3-border" type="number" name="poNumber" required>
                  </p>
                </div>
                <div class="w3-col m3 s12 w3-padding">
                  <p>
                    <label><b>MRN Number</b></label>
                    <input class="w3-input w3-border" type="text" name="mrnNumber">
                  </p>
                </div>
                <div class="w3-col m3 s12 w3-padding">
                  <p>
                    <label><b>Vendor</b></label>
                    <input id="vendorNameText" class="w3-input w3-border" type="text" disabled>
                    <input id="vendorIDText" class="w3-input w3-border" style="opacity:0;width:0;" type="text" name="vendorID" required>
                  </p>
                  <p>
                    <a onclick="searchVendor()" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                  </p>
                </div>
              </div>
              <div class="w3-card-2 w3-white w3-margin-top" id="poItemsDiv">
                <h4 class="w3-padding"><i>Item Details</i></h4>
                <div class="w3-row">
                  <div class="w3-half">
                    <div class="w3-col m6 s12 w3-padding">
                      <p>
                        <label><b>Item</b></label>
                        <input id="itemInputsName0" class="w3-input w3-border" type="text" name="itemName[]" disabled>
                        <input id="itemInputsID0" class="w3-input w3-border" style="opacity:0;width:0;" name="itemID[]" required>
                      </p>
                      <p>
                        <a onclick="searchItem(0)" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                      </p>
                    </div>
                    <div class="w3-col m2 s12 w3-padding">
                      <p>
                        <label><b>Quantity</b></label>
                        <input onchange="calc()" onkeyup="calc()" id="qtyInput0" class="w3-input w3-border" type="number" name="quantity[]" required>
                      </p>
                    </div>
                    <div class="w3-col m4 s12 w3-padding">
                      <p>
                        <label><b>Price</b></label>
                        <input onkeydown="validateNumber(event)" onkeyup="calc()" id="priceInput0" class="w3-input w3-border" type="text" name="price[]" required>
                      </p>
                    </div>
                  </div>
                  <div id="moreItemsDiv"></div>
                  <div class="w3-col m12 s12 w3-padding" style="">
                    <a class="w3-small" onclick="addMoreItems()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ add more items</a>
                  </div>
                </div>
              </div>
              <div class="w3-card-2 w3-white w3-margin-top">
                <h4 class="w3-padding"><i>Total Details</i></h4>
                <div class="w3-row">
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Currency</b></label>
                      <select onchange="calc()" class="w3-select w3-padding w3-border" name="currency">
                        <option value="BHD">BHD</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </p>
                  </div>
                </div>
                <div class="w3-row">
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Current Total</b></label>
                      <input id="currentTotalInput" class="w3-input w3-border" type="text" name="currentTotal">
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>VAT</b></label>
                      <input onchange="calc()" onkeyup="calc()" id="vatInput" class="w3-input w3-border" type="text" name="vat">
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Grand Total</b></label>
                      <input style="font-weight:bold;" id="grandTotalInput" class="w3-input w3-border" type="text" name="grandTotal">
                    </p>
                  </div>
                </div>
              </div>
              <div class="w3-card-2 w3-white w3-margin-top">
                <h4 class="w3-padding"><i>Date</i></h4>
                <div class="w3-row">
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Quotation Date</b></label>
                      <input class="w3-input w3-border" type="date" name="quotationDate" value="<?php echo date('Y-m-d'); ?>">
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Paid Date</b></label>
                      <input class="w3-input w3-border" type="date" name="paidDate">
                    </p>
                  </div>
                </div>
              </div>
              <div class="w3-card-2 w3-white w3-margin-top">
                <h4 class="w3-padding"><i>Options</i></h4>
                <div class="w3-row">
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Buyer</b></label>
                      <select class="w3-select w3-padding w3-border" name="buyer">
                        <option value="IT">IT</option>
                        <option value="I4">I4</option>
                      </select>
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Advance Request</b></label>
                      <select class="w3-select w3-padding w3-border" name="advanceRequest">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>LPO</b></label>
                      <select class="w3-select w3-padding w3-border" name="LPO">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Invoice</b></label>
                      <select class="w3-select w3-padding w3-border" name="invoice">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>Delivery Note</b></label>
                      <select class="w3-select w3-padding w3-border" name="deliveryNote">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </p>
                  </div>
                  <div class="w3-col m3 s12 w3-padding">
                    <p>
                      <label><b>MRN</b></label>
                      <select class="w3-select w3-padding w3-border" name="mrn">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </p>
                  </div>
                </div>
              </div>
              <div class="w3-card-2 w3-white w3-margin-top">
                <h4 class="w3-padding"><i>Notes</i></h4>
                <div class="w3-row">
                  <div class="w3-col m4 s12 w3-padding">
                    <p>
                      <label><b>For Who</b></label><br>
                      <textarea class="w3-input w3-border" name="forWho" rows="5" cols="80" style="resize:none;"></textarea>
                    </p>
                  </div>
                  <div class="w3-col m4 s12 w3-padding">
                    <p>
                      <label><b>Notes</b></label><br>
                      <textarea class="w3-input w3-border" name="notes" rows="5" cols="80" style="resize:none;"></textarea>
                    </p>
                  </div>
                  <div class="w3-col m4 s12 w3-padding">
                    <p>
                      <label><b>Link</b></label><br>
                      <input type="text" name="link" class="w3-input w3-border">
                    </p>
                  </div>
                </div>
              </div>
              <p style="text-align:right;">
                <input class="w3-btn" type="submit" value="SUBMIT">
              </p>
            </div>
          </form>
        </div>
      </div>

      <div id="vendorsDiv" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div id="vendorPopup" class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <input onkeyup="searchClicked(event)" id="searchInput" placeholder="search name/notes" class="w3-input w3-border" type="text">
            </div>
            <ul id="resultSearchList" class="w3-ul w3-small w3-margin" style="display:none;"></ul>
            <ul id="defaultSearch" class="w3-ul w3-small w3-margin">
              <li style='cursor:pointer;'>
                <div>
                  <?php
                    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
                    if ($mysqli->connect_errno) {
                      die("connectionFailed");
                    }
                    $sql = "SELECT * FROM `vendors`";
                    if(!$result = $mysqli->query($sql)){
                      die("queryFailed");
                    }
                    if ($result->num_rows === 0){
                      echo "no vendors";
                    }else{
                      $counter = 0;
                      while($row = $result->fetch_assoc()){
                        $Vnotes = $row['notes'];
                        $Vnotes = str_replace(array("\r", "\n"), '', $Vnotes);
                        ?>
                          <script>
                            vendorNames.push("<?php echo $row['name'];?>");
                            vendorsNotes.push("<?php echo $Vnotes;?>");
                            vendorsIDs.push("<?php echo $row['id'];?>");
                          </script>
                        <?php
                          echo "<div onclick='addVend(".$counter.")' class='w3-padding vendorResultElement' style='border-bottom:1px solid #e1e1e1;min-height:120px;'>";
                          if(!empty($row['image'])){
                            echo "<img class='w3-right' style='max-width:30%;max-height:100px;margin-right:5px;' src='http://iss.bfginternational.com/ISS/itemsImages/".$row['image']."' />";
                          }
                          echo "<h6 style='margin:0px;color:#0b5266;'>".$row['name']."</h6>";
                          echo "<p class='w3-text-grey' style='margin:0px;'><b>".$row['notes']."</b></p>";
                          $sql2 = "SELECT * FROM `vendorsContacts` WHERE `vendorID`=".$row['id'];
                          if(!$result2 = $mysqli->query($sql2)){
                            die("queryFailed");
                          }
                          if ($result2->num_rows>0){
                            echo "<p class='w3-small w3-text-grey'>";
                            while($row2 = $result2->fetch_assoc()){
                              echo $row2["contactName"]." (".$row2['personPosition'].") ".$row2["contact"]."<br>";
                            }
                            echo "</p>";
                          }
                          echo "</div>";
                          $counter = $counter + 1;
                      }
                    }
                  ?>
                </div>
              </li>
            </ul>
          </div>
          <div id="vendorAddDiv" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
            <h3>Add New Vendor</h3>
            <p>
              <label>Name</label>
              <input id="newVendorName" class="w3-input w3-border" type="text" name="name" maxlength="150">
            </p>
            <p>
              <label>Notes</label>
              <textarea id="newvendorNotes" class="w3-input w3-border" name="notes" rows="4" cols="80" style="resize:none;"></textarea>
            </p>
            <p>
              <label>Contact</label>
              <div class="w3-row">
                <div class="w3-col m2">
                  <select name="contactType" class="w3-select w3-padding w3-border" style="height:40px;">
                    <option value="mobile">mobile</option>
                    <option value="email">email</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div class="w3-col m3" style="padding-left:5px;">
                  <input class="w3-input w3-border" type="text" name="contactPositon" maxlength="100" placeholder="position">
                </div>
                <div class="w3-col m3" style="padding-left:5px;">
                  <input class="w3-input w3-border" type="text" name="contactName" maxlength="100" placeholder="name">
                </div>
                <div class="w3-col m3" style="padding-left:5px;">
                  <input class="w3-input w3-border" type="text" name="contactValue" maxlength="100" placeholder="value">
                </div>
              </div>
            </p>
            <div id="moreContactDiv"></div>
            <a class="w3-small" onclick="addMoreContact()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ add more</a>
            <div>
              <a onclick="addNewVendorSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">Add Vendor</a>
            </div>
          </div>
          <div id="vendorLoading" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
            <h3 class="w3-margin-top w3-center">Loading ...</h3>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('vendorsDiv').style.display='none'">Close</div>
            <div id="addNewPopupBtn" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showVendorForm()">Add New</div>
            <div id="searchPopupBtn" style="display:none;" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showSearchForm()">Search</div>
          </div>
        </div>
      </div>

      <div id="itemsDiv" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div id="itemPopup" class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <input onkeyup="searchClicked2(event)" id="searchInput2" placeholder="search name/brand" class="w3-input w3-border" type="text">
            </div>
            <ul id="resultSearchListItems" class="w3-ul w3-small w3-margin" style="display:none;"></ul>
            <ul id="defaultSearchItems" class="w3-ul w3-small w3-margin">
              <li style='cursor:pointer;'>
                <div>
                  <?php
                    $sql3 = "SELECT * FROM `items` WHERE `inActive`=0";
                    if(!$result3 = $mysqli->query($sql3)){
                      die("queryFailed");
                    }
                    if ($result3->num_rows === 0){
                      echo "no items";
                    }else{
                      $counter = 0;
                      while($row3 = $result3->fetch_assoc()){
                        $item =addslashes($row3['name']);
                        ?>
                          <script>
                            itemsNames.push("<?php echo $item;?>");
                            itemsBrands.push("<?php echo $row3['brand'];?>");
                            itemsIDs.push("<?php echo $row3['id'];?>");
                            itemsStock.push("<?php echo $row3['stock'];?>");
                          </script>
                        <?php
                          echo "<div onclick='addItem(".$counter.")' class='w3-padding vendorResultElement' style='border-bottom:1px solid #e1e1e1'>";
                          echo "<h6 style='margin:0px;color:#0b5266;'>".$row3['name']."</h6>";
                          echo "<p class='w3-text-grey' style='margin:0px;'><b>".$row3['brand']."</b></p>";
                          echo "</div>";
                          $counter = $counter + 1;
                      }
                    }
                  ?>
                </div>
              </li>
            </ul>
          </div>
          <div id="itemAddDiv" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
            <h3>Add New Item</h3>
            <p>
              <label>Name</label>
              <input id="newItemName" class="w3-input w3-border" type="text" maxlength="100">
            </p>
            <p>
              <label>Brand</label>
              <input id="newItemBrand" class="w3-input w3-border" type="text" maxlength="100">
            </p>
            <p>
              <label>Stock</label>
              <input id="newItemStock" class="w3-input w3-border" type="number" value="0">
            </p>
            <p>
              <label>Category</label>
              <select class="w3-select w3-border w3-padding" id="newItemCategory">
                <option value="IT Stationery and Accessories">IT Stationery and Accessories</option>
                <option value="Hardware">Hardware</option>
                <option value="Toners/Rolls">Toners/Rolls</option>
              </select>
            </p>
            <div>
              <a onclick="addNewItemSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">Add Item</a>
            </div>
          </div>
          <div id="itemLoading" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
            <h3 class="w3-margin-top w3-center">Loading ...</h3>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('itemsDiv').style.display='none'">Close</div>
            <div id="addNewItemPopupBtn" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showItemForm()">Add New</div>
            <div id="searchItemPopupBtn" style="display:none;" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showItemSearchForm()">Search</div>
          </div>
        </div>
      </div>

      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

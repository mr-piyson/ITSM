<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql0 = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result0 = $mysqli->query($sql0)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result0->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      $row0 = $result0->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>

      <script>
        var vendorNames = [];
        var vendorsNotes = [];
        var vendorsIDs = [];
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
            postData = postData + "&user=<?php echo $row0['id']; ?>";
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

      <div class="w3-container">
        <div class="w3-margin-top w3-padding">
          <h1 class="w3-padding title">Add New Contract</h1>
          <form class="w3-padding" action="addContract.php" method="post">
            <p>
              <label>Product / Service</label>
              <input class="w3-input w3-border" style="max-width:820px;" type="text" name="productName" maxlength="100" required>
            </p>
            <div class="w3-margin-top">
              <label>Vendor</label>
              <br>
              <div style="display:inline-block;width:300px;vertical-align:bottom;">
                <input id="vendorNameText" class="w3-input w3-border" type="text" disabled>
              </div>
              <div style="display:inline-block;width:300px;margin-left:16px;">
                <a onclick="searchVendor()" class="w3-btn w3-small" style="background:#128cae;color:#fff;margin-top:-16px;">Search</a>
                <input id="vendorIDText" style="opacity:0;width:0;display:inline-block;" type="text" name="vendorID" required>
              </div>
            </div>
            <div class="w3-margin-top">
              <div style="display:inline-block;width:300px;">
                <label>Start Date</label>
                <input class="w3-input w3-border" type="date" name="startDate" style="max-width:300px;" required>
              </div>
              <div style="display:inline-block;width:300px;margin-left:16px;">
                <label>End Date</label>
                <input class="w3-input w3-border" type="date" name="endDate" style="max-width:300px;" required>
              </div>
            </div>
            <div class="w3-margin-top">
              <div style="display:inline-block;width:300px;">
                <label>Cost</label>
                <br>
                <select class="w3-select w3-border w3-padding" name="currency" style="max-width:95px;">
                  <option value="BHD">BHD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <input class="w3-input w3-border" style="max-width:200px;display:inline-block;" type="text" name="cost" maxlength="50" required>
              </div>
              <div style="display:inline-block;width:300px;margin-left:16px;">
                <label>Billing Cycle</label>
                <br>
                <select class="w3-select w3-border w3-padding" name="bilingCycle" style="max-width:300px;">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            <p>
              <label>Account</label>
              <input class="w3-input w3-border" style="max-width:820px;" type="text" name="account" maxlength="100">
            </p>
            <div class="w3-margin-top">
              <div style="display:inline-block;width:400px;">
                <label>Notes</label>
                <textarea class="w3-input w3-border" name="notes" rows="5" cols="80" style="resize:none;"></textarea>
              </div>
              <div style="display:inline-block;width:400px;margin-left:16px;">
                <label>Support</label>
                <textarea class="w3-input w3-border" name="support" rows="5" cols="80" style="resize:none;"></textarea>
              </div>
            </div>
            <input type="hidden" name="user" value="<?php echo $row0['id']; ?>">
            <input class="w3-btn w3-margin-top" style="background:#128cae;color:#fff;" type="submit" value="Add Contract">
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

      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

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
        var empNames = [];
        var empIDs = [];
        var assetNames = [];
        var assetIDs = [];
        var assetTypes = [];
        var assetManufacturers = [];
        var assetModels = [];
        var assetLocations = [];
        function searchEmp(x){
          document.getElementById("empDiv").style.display = "block";
        }
        function addEmp(x){
          document.getElementById("empInputsName").value = empNames[x];
          document.getElementById("empInputsID").value = empIDs[x];
          document.getElementById("empDiv").style.display = "none";
        }
        function searchClicked3(e) {
          if ((document.getElementById('searchInput3').value.trim().length > 1)){
            document.getElementById("defaultSearchEmp").style.display = "none";
            document.getElementById("resultSearchListEmp").style.display = "block";
            document.getElementById("resultSearchListEmp").innerHTML = "";
            for (var i=0;i<empNames.length;i++) {
              if (empNames[i].toUpperCase().includes(document.getElementById("searchInput3").value.trim().toUpperCase()) || empIDs[i].toUpperCase().includes(document.getElementById("searchInput3").value.trim().toUpperCase())){
                document.getElementById("resultSearchListEmp").innerHTML = document.getElementById("resultSearchListEmp").innerHTML + "<li><div onclick='addEmp("+i+")' class='w3-padding vendorResultElement' style='cursor:pointer;'><h6 style='margin:0px;color:#0b5266;'>"+empNames[i]+"</h6><p class='w3-text-grey' style='margin:0px;'><b>"+empIDs[i]+"</b></p></li>";
              }
            }
          }else{
            document.getElementById("resultSearchListEmp").innerHTML = "";
            document.getElementById("resultSearchListEmp").style.display = "none";
            document.getElementById("defaultSearchEmp").style.display = "block";
          }
        }
        function searchAsset(x){
          document.getElementById("assetsDiv").style.display = "block";
        }
        function addAsset(x){
          document.getElementById("assetInputName").value = assetNames[x] +" ("+assetTypes[x]+")";
          document.getElementById("assetInputID").value = assetIDs[x];
          document.getElementById("assetsDiv").style.display = "none";
        }
        function searchClicked2(e) {
          if ((document.getElementById('searchInput2').value.trim().length > 1)){
            for (let x=0;x<document.getElementsByClassName('assetSearchElement').length;x++){
              document.getElementsByClassName('assetSearchElement')[x].style.display = "none";
            }
            for (var i=0;i<assetNames.length;i++) {
              if (assetNames[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase()) ||
                  assetTypes[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase()) ||
                  assetManufacturers[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase()) ||
                  assetModels[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase()) ||
                  assetLocations[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase())){
                for (let n=0;n<document.getElementsByClassName('assetSearchElement').length;n++){
                  if(n == i){
                    document.getElementsByClassName('assetSearchElement')[n].style.display = "block";
                  }
                }
              }
            }
          }else{
            for (let x=0;x<document.getElementsByClassName('assetSearchElement').length;x++){
              document.getElementsByClassName('assetSearchElement')[x].style.display = "block";
            }
          }
        }
        function showPurposeList(){
          if(document.getElementById("purposeList").style.display == "block"){
            document.getElementById("purposeList").style.display = "none";
          }else{
            document.getElementById("purposeList").style.display = "block";
          }
        }
        function changePurpose(purpose){
          document.getElementsByName("purpose")[0].value = purpose;
          showPurposeList();
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
        .assetSearchElement{
          transition: all 0.5s;
        }
        .assetSearchElement:hover{
          background: #f1f1f1 !important;
        }
        #purposeList li{
          padding:5px;
          cursor: pointer;
        }
        #purposeList li:hover{
          background: #f7f1ef;
          transition: all 0.3s;
        }
      </style>

      <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
        <div class="w3-padding w3-margin-top">
          <a class="w3-small w3-btn w3-border w3-light-grey" href="bookingList.php">All Booking List</a>
        </div>
        <h1 class="w3-padding title">Asset Booking</h1>
        <div class="w3-padding">
          <form action="addBooking.php" method="post">
            <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
            <div class="w3-row">
              <div class="w3-col m3 s12 w3-padding">
                <p style="margin-bottom:0;">
                  <label><b>Employee</b></label>
                  <input id="empInputsName" class="w3-input w3-border" type="text" disabled>
                  <input id="empInputsID" style="opacity:0;width:0;" name="empID" required>
                </p>
                <p style="margin-top:0;">
                  <a onclick="searchEmp()" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                </p>
              </div>
              <div class="w3-col m3 s12 w3-padding">
                <p style="margin-bottom:0;">
                  <label><b>Asset</b></label>
                  <input id="assetInputName" class="w3-input w3-border" type="text" disabled>
                  <input id="assetInputID" style="opacity:0;width:0;" name="assetID" required>
                </p>
                <p style="margin-top:0;">
                  <a onclick="searchAsset()" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                </p>
              </div>
            </div>
            <div class="w3-row">
              <div class="w3-col m2 s12 w3-padding">
                <p>
                  <label><b>Start Date</b></label>
                  <input type="date" class="w3-input w3-border" name="startDate" value="<?php echo date('Y-m-d'); ?>">
                </p>
              </div>
              <div class="w3-col m2 s12 w3-padding">
                <p>
                  <label><b>End Date</b></label>
                  <input type="date" class="w3-input w3-border" name="endDate" value="<?php echo date('Y-m-d'); ?>">
                </p>
              </div>
            </div>
            <div class="w3-row">
              <div class="w3-col m3 s12 w3-padding">
                <p style="margin-bottom:0px;">
                  <label><b>Purpose</b></label>
                  <input style="outline:none;" onclick="showPurposeList()" class="w3-input w3-border" type="text" name="purpose" maxlength="100" required>
                </p>
                <ul class="w3-border" id="purposeList" style="list-style:none;padding:0;margin:0;display:none;background:#f9f9f9;">
                  <li onclick="changePurpose('Traveling')">Traveling</li>
                  <li onclick="changePurpose('Maternity Leave')">Maternity Leave</li>
                  <li onclick="changePurpose('Working from Home')">Working from Home</li>
                  <li onclick="changePurpose('Meeting')">Meeting</li>
                  <li onclick="changePurpose('Site')">Site</li>
                  <li onclick="changePurpose('Factory Visit')">Factory Visit</li>
                </ul>
              </div>
            </div>
            <div class="w3-row">
              <div class="w3-col m3 s12 w3-padding">
                <p style="margin-bottom:0px;">
                  <label><b>Other Information</b></label>
                  <input style="outline:none;" class="w3-input w3-border" type="text" name="otherInfo" maxlength="100">
                </p>
              </div>
            </div>
            <div class="w3-padding w3-margin-top">
              <input class="w3-btn" style="background:#128cae;color:#fff;" type="submit" value="Book">
            </div>
          </form>
        </div>
      </div>

      <div id="empDiv" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div id="empPopup" class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <input onkeyup="searchClicked3(event)" id="searchInput3" placeholder="search name/ID" class="w3-input w3-border" type="text">
            </div>
            <ul id="resultSearchListEmp" class="w3-ul w3-small w3-margin" style="display:none;"></ul>
            <ul id="defaultSearchEmp" class="w3-ul w3-small w3-margin">
              <li style='cursor:pointer;'>
                <div>
                  <?php
                    $sql4 = "SELECT * FROM `employees` WHERE `inActive`=0";
                    if(!$result4 = $mysqli->query($sql4)){
                      die("queryFailed");
                    }
                    if ($result4->num_rows === 0){
                      echo "no employees";
                    }else{
                      $counter = 0;
                      while($row4 = $result4->fetch_assoc()){
                        ?>
                          <script>
                            empNames.push("<?php echo $row4['name'];?>");
                            empIDs.push("<?php echo $row4['empID'];?>");
                          </script>
                        <?php
                          echo "<div onclick='addEmp(".$counter.")' class='w3-padding vendorResultElement' style='border-bottom:1px solid #e1e1e1'>";
                          echo "<h6 style='margin:0px;color:#0b5266;'>".$row4['name']."</h6>";
                          echo "<p class='w3-text-grey' style='margin:0px;'><b>".$row4['empID']."</b></p>";
                          echo "</div>";
                          $counter = $counter + 1;
                      }
                    }
                  ?>
                </div>
              </li>
            </ul>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('empDiv').style.display='none'">Close</div>
          </div>
        </div>
      </div>

      <div id="assetsDiv" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <input onkeyup="searchClicked2(event)" id="searchInput2" placeholder="search device name" class="w3-input w3-border" type="text">
            </div>
            <ul id="defaultSearchAssets" class="w3-ul w3-small w3-margin">
              <li style='cursor:pointer;'>
                <div>
                  <?php
                    $sql3 = "SELECT * FROM `assets` WHERE `deviceStatus` = 'Available'";
                    if(!$result3 = $mysqli->query($sql3)){
                      die("queryFailed");
                    }
                    if ($result3->num_rows === 0){
                      echo "no assets";
                    }else{
                      $counter = 0;
                      while($row3 = $result3->fetch_assoc()){
                        ?>
                          <script>
                            assetNames.push("<?php echo $row3['deviceName'];?>");
                            assetTypes.push("<?php echo $row3['type'];?>");
                            assetManufacturers.push("<?php echo $row3['manufacturer'];?>");
                            assetModels.push("<?php echo $row3['model'];?>");
                            assetLocations.push("<?php echo $row3['location'];?>");
                            assetIDs.push("<?php echo $row3['id'];?>");
                          </script>
                        <?php
                          echo "<div onclick='addAsset(".$counter.")' class='w3-padding assetSearchElement' style='border-bottom:1px solid #e1e1e1'>";
                          echo "<h6 style='margin:0px;color:#0b5266;'>".$row3['deviceName']."</h6>";
                          echo "<p class='w3-text-grey' style='margin:0px;'><b>".$row3['type']." (".$row3['manufacturer']." - ".$row3['model'].")</b></p>";
                          echo "<p class='w3-text-grey' style='margin:0px;'><b>".$row3['location']."</b></p>";
                          echo "</div>";
                          $counter = $counter + 1;
                      }
                    }
                  ?>
                </div>
              </li>
            </ul>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('assetsDiv').style.display='none'">Close</div>
          </div>
        </div>
      </div>

      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

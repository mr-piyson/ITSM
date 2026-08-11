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
      <script src="qrcode.js"></script>
      <script>
        var empNames = [];
        var empIDs = [];
        function generateCode(){
          let newCode = "";
          let charactersNumbers = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R",
                                   "S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"];
          for (let i=0;i<10;i++){
            newCode = newCode + charactersNumbers[Math.floor(Math.random() * charactersNumbers.length)];
          }
          document.getElementById("qrcode").innerHTML = "";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'checkCodeAvailability.php', true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              if(xhr.responseText == "available"){
                document.getElementsByName('code')[0].value = newCode;
                document.getElementById("codeDiv").innerHTML = newCode;
                new QRCode(document.getElementById("qrcode"), {
                  text:"http://iss.bfginternational.com/ISS/assetDetails.php?code="+newCode,
                  width:200,
                  height:200
                });
              }else{
                generateCode();
              }
            }
          }
          xhr.send("code="+newCode);
        }
        function searchClicked(e) {
          if ((document.getElementById('searchInput').value.trim().length > 1)){
            document.getElementById("defaultSearchEmp").style.display = "none";
            document.getElementById("resultSearchListEmp").style.display = "block";
            document.getElementById("resultSearchListEmp").innerHTML = "";
            for (var i=0;i<empNames.length;i++) {
              if (empNames[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase()) ||
                  empIDs[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase())){
                    document.getElementById("resultSearchListEmp").innerHTML = document.getElementById("resultSearchListEmp").innerHTML + `
                    <li><div onclick='addEmp(`+i+`)' class='w3-padding vendorResultElement' style='border-bottom:1px solid #e1e1e1;cursor:pointer;'>
                    <h6 style='margin:0px;color:#0b5266;'>`+empNames[i]+`</h6><p class='w3-text-grey' style='margin:0px;'><b>`+empIDs[i]+`</b></p></li>`;
              }
            }
          }else{
            document.getElementById("resultSearchListEmp").innerHTML = "";
            document.getElementById("resultSearchListEmp").style.display = "none";
            document.getElementById("defaultSearchEmp").style.display = "block";
          }
        }
        function addEmp(x){
          document.getElementById("ownerNameInput").value = empNames[x];
          document.getElementById("empIdHiddenInput").value = empIDs[x];
          document.getElementById("empDiv").style.display = "none";
        }
      </script>
      <style>
        input,select,textarea{
          background: #f9f9f9 !important;
          outline: none;
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
      </style>
      <div class="w3-container w3-margin-top" style="padding-bottom:40px;">
        <div class="w3-margin-top w3-padding w3-light-grey" style="padding-bottom:40px !important;">
          <h1 class="w3-padding title">Add New Asset</h1>
          <form class="w3-padding" action="addNewAsset.php" method="post" enctype="multipart/form-data">
            <div class="w3-card-2 w3-white">
              <h4 class="w3-padding"><i>Code</i></h4>
              <a onclick="generateCode()" class="w3-btn w3-margin-top w3-margin-left w3-margin-bottom" style="background:#128cae;color:#fff;">Generate New Code</a>
              <div id="codeDiv" style="width:200px;background:#eee !important;border:0;padding:8px;vertical-align:middle;display:inline-block;height:40px"></div>
              <input style="opacity:0;" type="text" name="code" maxlength="10" required>
              <div id="qrcode" class="w3-padding"></div>
              <br>
            </div>
            <div class="w3-card-2 w3-white w3-margin-top" style="padding-bottom:20px;">
              <h4 class="w3-padding"><i>General Information</i></h4>
              <div class="w3-row">
                <div class="w3-quarter w3-padding">
                  <label>Device type</label>
                  <select class="w3-select w3-border w3-padding" name="type">
                    <option value="Desktop">Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Tablet">Tablet</option>
                    <option value="CCTV">CCTV</option>
                    <option value="Face Access">Face Access</option>
                    <option value="Wifi Access Point">Wifi Access Point</option>
                    <option value="TV">TV</option>
                    <option value="Switches">Switches</option>
                    <option value="Blade Server">Blade Server</option>
                    <option value="UPS">UPS</option>
                    <option value="Tape Drive">Tape Drive</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Raspberry Pi">Raspberry Pi</option>
                    <option value="Telephone">Telephone</option>
                    <option value="P2P Network">P2P Network</option>
                    <option value="AC">AC</option>
                    <option value="Display Projector">Display Projector</option>
                    <option value="Router">Router</option>
                  </select>
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Location</label>
                  <select class="w3-select w3-border w3-padding" name="location">
                    <option value=""></option>
                    <option value="Head Office">Head Office</option>
                    <option value="Factory 1">Factory 1</option>
                    <option value="Factory 2">Factory 2</option>
                    <option value="Factory 3">Factory 3</option>
                    <option value="Factory 4">Factory 4</option>
                    <option value="Factory 5 - Nass">Factory 5 - Nass</option>
                    <option value="IT Stores">IT Stores</option>
                  </select>
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Department</label>
                  <select class="w3-select w3-border w3-padding" name="department">
                    <option value=""></option>
                    <option value="After Sales">After Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="H2O">H2O</option>
                    <option value="HR">HR</option>
                    <option value="Health & Safety">Health & Safety</option>
                    <option value="I4">I4</option>
                    <option value="IT">IT</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Management">Management</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Planning">Planning</option>
                    <option value="Process">Process</option>
                    <option value="Projects">Projects</option>
                    <option value="SCM">SCM</option>
                    <option value="Sales">Sales</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Wind Energy">Wind Energy</option>
                    <option value="Bids">Bids</option>
                    <option value="Business Development">Business Development</option>
                    <option value="Tooling">Tooling</option>
                    <option value="Quality">Quality</option>
                    <option value="Production">Production</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Final Quality">Final Quality</option>
                    <option value="Packing">Packing</option>
                    <option value="Resin Stores">Resin Stores</option>
                    <option value="Paint Stores">Paint Stores</option>
                    <option value="Gelcoating">Gelcoating</option>
                    <option value="Store">Store</option>
                    <option value="ABB">ABB</option>
                    <option value="Metal">Metal</option>
                  </select>
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Owner</label>
                  <input id="ownerNameInput" class="w3-input w3-border" type="text" disabled>
                  <input id="empIdHiddenInput" type="hidden" name="empID">
                  <a onclick="document.getElementById('empDiv').style.display='block'" class="w3-btn w3-margin-top w3-small" style="background:#128cae;color:#fff;">Search</a>
                </div>
              </div>
            </div>
            <div class="w3-card-2 w3-white w3-margin-top" style="padding-bottom:20px;">
              <h4 class="w3-padding"><i>Device Information</i></h4>
              <div class="w3-row">
                <div class="w3-quarter w3-padding">
                  <label>Device Name</label>
                  <input class="w3-input w3-border" type="text" name="deviceName" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Serial number</label>
                  <input class="w3-input w3-border" type="text" name="serialNumber" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Manufacturer</label>
                  <input class="w3-input w3-border" type="text" name="manufacturer" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Model</label>
                  <input class="w3-input w3-border" type="text" name="model" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>IP</label>
                  <input class="w3-input w3-border" type="text" name="ip" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Firmware Version</label>
                  <input class="w3-input w3-border" type="text" name="firmware" maxlength="50">
                </div>
              </div>
            </div>
            <div class="w3-card-2 w3-white w3-margin-top" style="padding-bottom:20px;">
              <h4 class="w3-padding"><i>Computer Information</i></h4>
              <div class="w3-row">
                <div class="w3-quarter w3-padding">
                  <label>Processor</label>
                  <input class="w3-input w3-border" type="text" name="processor" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Operating System</label>
                  <input class="w3-input w3-border" type="text" name="os" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Memory</label>
                  <input class="w3-input w3-border" type="text" name="memory" maxlength="50">
                </div>
                <div class="w3-quarter w3-padding">
                  <label>Hard Disk</label>
                  <input class="w3-input w3-border" type="text" name="hdd" maxlength="50">
                </div>
              </div>
            </div>
            <div class="w3-card-2 w3-white w3-margin-top" style="padding-bottom:20px;">
              <h4 class="w3-padding"><i>Other Information</i></h4>
              <div class="w3-row">
                <div class="w3-half w3-padding">
                  <label>Other Specifications</label>
                  <textarea class='w3-input w3-border' style="resize:none;" name="specification" rows="5" cols="50"></textarea>
                </div>
                <div class="w3-half w3-padding">
                  <label>Image</label>
                  <input class="w3-input w3-border" name="imagesFiles" type="file" accept="image/*">
                </div>
              </div>
            </div>
            <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
            <input class="w3-btn w3-margin-top" style="background:#128cae;color:#fff;" type="submit" value="Add Asset">
          </form>
        </div>
      </div>

      <div id="empDiv" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div id="empPopup" class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <input onkeyup="searchClicked(event)" id="searchInput" placeholder="search name/ID" class="w3-input w3-border" type="text">
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
                    $mysqli->close();
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
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

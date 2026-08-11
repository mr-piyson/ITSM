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
      if(isset($_POST["valid"])){
        $sql2 = "SELECT vendors.name as vendorName,contracts.* FROM contracts
                 LEFT JOIN vendors
                 ON contracts.vendorID = vendors.id
                 WHERE contracts.endDate > '".date('Y-m-d')."'
                 AND contracts.inActive = 0
                 ORDER BY contracts.endDate";
      }else{
        $sql2 = "SELECT vendors.name as vendorName,contracts.* FROM contracts
                 LEFT JOIN vendors
                 ON contracts.vendorID = vendors.id
                 WHERE contracts.inActive = 0
                 ORDER BY contracts.endDate";
      }
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows > 0){
        ?>

        <script>
          var selectedContractID;
          function showUpdateModal(contractID){
            selectedContractID = contractID;
            document.getElementById("updateHeaderDiv").innerHTML = "Loading ...";
            document.getElementsByName("startDate")[0].value = "0000-00-00";
            document.getElementsByName("endDate")[0].value = "0000-00-00";
            document.getElementsByName("currency")[0].value = "BHD";
            document.getElementsByName("cost")[0].value = "";
            document.getElementsByName("bilingCycle")[0].value = "monthly";
            document.getElementsByName("account")[0].value = "";
            document.getElementsByName("notes")[0].value = "";
            document.getElementsByName("support")[0].value = "";
            document.getElementsByName("docslink")[0].value = "";
            document.getElementById("updateHeaderDiv").style.display = "block";
            document.getElementById("updateContractDiv").style.display = "none";
            document.getElementById('updateContractModel').style.display='block';
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'getContractDetails.php', true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                document.getElementById("updateHeaderDiv").style.display = "none";
                document.getElementById("updateContractDiv").style.display = "block";
                if(xhr.responseText != "failed"){
                  let respObj = JSON.parse(xhr.responseText);
                  document.getElementsByName("startDate")[0].value = respObj["startDate"];
                  document.getElementsByName("endDate")[0].value = respObj["endDate"];
                  document.getElementsByName("currency")[0].value = respObj["currency"];
                  document.getElementsByName("cost")[0].value = respObj["cost"];
                  document.getElementsByName("bilingCycle")[0].value = respObj["bilingCycle"];
                  document.getElementsByName("account")[0].value = respObj["account"];
                  document.getElementsByName("notes")[0].value = respObj["notes"];
                  document.getElementsByName("support")[0].value = respObj["support"];
                  document.getElementsByName("docslink")[0].value = respObj["docslink"];
                }
              }
            }
            xhr.send("contractID="+contractID);
          }
          function updateContractSubmitted(){
            if(document.getElementsByName('cost')[0].value.trim().length < 1){
              alert("Please fill Contract's cost !");
            }else{
              document.getElementById("updateDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
              document.getElementById("deleteDiv").innerHTML = "";
              let postData;
              postData = "startDate="+document.getElementsByName("startDate")[0].value;
              postData = postData + "&endDate="+document.getElementsByName("endDate")[0].value;
              postData = postData + "&currency="+document.getElementsByName("currency")[0].value;
              postData = postData + "&cost="+document.getElementsByName("cost")[0].value.trim();
              postData = postData + "&bilingCycle="+document.getElementsByName("bilingCycle")[0].value;
              postData = postData + "&account="+document.getElementsByName("account")[0].value.trim();
              postData = postData + "&notes="+document.getElementsByName("notes")[0].value.trim();
              postData = postData + "&support="+document.getElementsByName("support")[0].value.trim();
              postData = postData + "&docslink="+document.getElementsByName("docslink")[0].value.trim();
              postData = postData + "&user=<?php echo $row['id']; ?>";
              postData = postData + "&contractID="+selectedContractID;
              var xhr = new XMLHttpRequest();
              xhr.open("POST", 'updateContract.php', true);
              xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
              xhr.onreadystatechange = function() {
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                  document.getElementById("updateHeaderDiv").style.display = "block";
                  document.getElementById("updateContractDiv").style.display = "none";
                  if(xhr.responseText == "updated"){
                    document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Updated Successfully!</h3>";
                    setTimeout(function(){
                      location.reload();
                    }, 1000);
                  }else{
                    document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                  }
                }
              }
              xhr.send(postData);
            }
          }
          function deleteContractSubmitted(){
            document.getElementById("updateDiv").innerHTML = "";
            document.getElementById("deleteDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'deleteContract.php', true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                document.getElementById("updateHeaderDiv").style.display = "block";
                document.getElementById("updateContractDiv").style.display = "none";
                if(xhr.responseText == "deleted"){
                  document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Deleted Successfully!</h3>";
                  setTimeout(function(){
                    location.reload();
                  }, 1000);
                }else{
                  document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                }
              }
            }
            xhr.send("contractID="+selectedContractID+"&user=<?php echo $row['id']; ?>");
          }
        </script>

        <div class="w3-container" style="padding-bottom:40px;">
          <div class="w3-padding">
            <h1 class="w3-padding title">Contracts</h1>
            <div class='w3-container w3-margin-bottom'>
              <a href='newContract.php' class='w3-btn w3-border w3-small'>Add new contract</a>
              <?php
                if(isset($_POST['valid'])){
                  echo "<form action='contracts.php' method='post' class='w3-right'>";
                  echo "<input class='w3-btn w3-small w3-border' type='submit' value='All Contracts'>";
                  echo "</form>";
                }else{
                  echo "<form action='contracts.php' method='post' class='w3-right'>";
                  echo "<input type='hidden' name='valid'>";
                  echo "<input class='w3-btn w3-small w3-border' type='submit' value='Valid Contracts'>";
                  echo "</form>";
                }
              ?>
            </div>
            <div class="w3-row">
            <?php
              while($row2 = $result2->fetch_assoc()){
                $date1 = new DateTime($row2['endDate']);
                $date2 = new DateTime(date('Y-m-d'));
                $interval = $date1->diff($date2);
                echo "<div class='w3-third w3-padding'>";
                echo "<h3 class='w3-padding' style='margin:0;background:#cddbe7;height:90px;'>".$row2['productName']."</h3>";
                echo "<div class='w3-light-grey w3-padding' style='height:530px;overflow:auto;'>";
                echo "<a onclick='showUpdateModal(".$row2['id'].")' class='w3-btn w3-small w3-border w3-white w3-right'>Update</a>";
                echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Start date</p>";
                echo "<h6 style='margin-top:0;'>".$row2['startDate']."</h6>";
                echo "<p class='w3-small w3-text-grey' style='margin:0px;'>End date</p>";
                if($row2['endDate'] < date('Y-m-d')){
                  echo "<h4 style='margin-top:0;'><b>".$row2['endDate']."</b> <span class='w3-tag w3-red'>Expired</span></h4>";
                }else{
                  echo "<h4 style='margin-top:0;'><b>".$row2['endDate']."</b> <span class='w3-tag w3-green'>".$interval->days." days</span></h4>";
                }
                echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Vendor</p>";
                echo "<h4 style='margin-top:0;'>".$row2['vendorName']."</h4>";
                echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Cost</p>";
                echo "<h4 style='margin-top:0;'><b>".$row2['currency']." ".$row2['cost']."</b></h4>";
                echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Billing Cycle</p>";
                echo "<h5 style='margin-top:0;'>".$row2['bilingCycle']."</h5>";
                if(!empty($row2['account'])){
                  echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Account</p>";
                  echo "<h5 style='margin-top:0;'>".$row2['account']."</h5>";
                }
                if(!empty($row2['notes'])){
                  echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Notes</p>";
                  echo "<h5 style='margin-top:0;'>".$row2['notes']."</h5>";
                }
                if(!empty($row2['support'])){
                  echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Support</p>";
                  echo "<h5 style='margin-top:0;'>".$row2['support']."</h5>";
                }
                if(!empty($row2['docslink'])){
                  //echo "<p class='w3-small w3-text-grey' style='margin:0px;'>Documents Link</p>";
                  echo "<a href='".$row2['docslink']."' style='margin-top:0;'>Documents Link<a>";
                }
                echo "</div></div>";
              }
            ?>
            </div>
          </div>
        </div>

        <div id="updateContractModel" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:700px;overflow:auto;background:#f9f9f9;">
              <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="updateContractDiv" class="w3-container w3-margin">
                <h2 class="title">Update Contract Details</h2>
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
                    <select class="w3-select w3-border w3-padding w3-white" name="currency" style="max-width:95px;">
                      <option value="BHD">BHD</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <input class="w3-input w3-border" style="max-width:200px;display:inline-block;" type="text" name="cost" maxlength="50" required>
                  </div>
                  <div style="display:inline-block;width:300px;margin-left:16px;">
                    <label>Billing Cycle</label>
                    <br>
                    <select class="w3-select w3-border w3-padding w3-white" name="bilingCycle" style="max-width:300px;">
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>
                <p>
                  <label>Account</label>
                  <input class="w3-input w3-border" style="max-width:620px;" type="text" name="account" maxlength="100">
                </p>
                <div class="w3-margin-top">
                  <div style="display:inline-block;width:300px;">
                    <label>Notes</label>
                    <textarea class="w3-input w3-border" name="notes" rows="5" cols="80" style="resize:none;"></textarea>
                  </div>
                  <div style="display:inline-block;width:300px;margin-left:16px;">
                    <label>Support</label>
                    <textarea class="w3-input w3-border" name="support" rows="5" cols="80" style="resize:none;"></textarea>
                  </div>
                  <div style="display:inline-block;">
                    <label>Documents Link</label>
                    <input class="w3-input w3-border" type="text" name="docslink" style="height: 50px; width: 622px;">
                  </div>
                </div>
                <div id="updateDiv">
                  <a onclick="updateContractSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>
                </div>
                <div id="deleteDiv">
                  <a onclick="deleteContractSubmitted()" class="w3-margin-top w3-btn w3-brown">DELETE</a>
                </div>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateContractModel').style.display='none'">Close</div>
            </div>
          </div>
        </div>

        <?php
      }else{
        echo "<div class='w3-container'><h2>No Contracts</h2></div>";
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

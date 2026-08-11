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
      if(isset($_GET["emp"]) && !empty($_GET["emp"])){
        $row = $result->fetch_array(MYSQLI_ASSOC);
        $assets = "";
        $printers = "";
        $provides = "";
        $empID = htmlspecialchars($_GET['emp'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $empID);
        $sql2 = "SELECT * FROM `assets` WHERE `empID`=".$input2;
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows === 0){
          $assets = "<h6>No assets</h6>";
        }else{
          while($row2 = $result2->fetch_assoc()){
            $tagColor = "";
            if($row2["type"] == "Desktop"){
              $tagColor = "teal";
            }elseif ($row2["type"] == "Laptop") {
              $tagColor = "dark-grey";
            }elseif ($row2["type"] == "Monitor") {
              $tagColor = "brown";
            }
            $assets = $assets . "<tr><td style='vertical-align: middle;'><span class='w3-tag w3-".$tagColor."'>".$row2['type']."</span></td>
                                     <td style='vertical-align: middle;'>".$row2['manufacturer']."</td>
                                     <td style='vertical-align: middle;'>".$row2['model']."</td>
                                     <td style='vertical-align: middle;'>
                                     <a target='_blank' href='assetDetails.php?code=".$row2['code']."' class='w3-btn w3-border w3-small'>Details</a>
                                     </td></tr>";
          }
        }
        $sql3 = "SELECT * FROM `printers` WHERE `empID`=".$input2;
        if(!$result3 = $mysqli->query($sql3)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result3->num_rows === 0){
          $printers = "<h6>No printers</h6>";
        }else{
          while($row3 = $result3->fetch_assoc()){
            $printers = $printers . "<tr><td style='vertical-align: middle;'>".$row3['name']."</td>
                                     <td style='vertical-align: middle;'>
                                     <a target='_blank' href='printerDetails.php?id=".$row3['id']."' class='w3-btn w3-border w3-small'>Details</a>
                                     </td></tr>";
          }
        }
        $sql4 = "SELECT items.name,provide.id FROM provide
                 LEFT JOIN provideItems
                 ON provideItems.provideID = provide.id
                 LEFT JOIN items
                 ON items.id = provideItems.itemID WHERE provide.empID=".$input2;
        if(!$result4 = $mysqli->query($sql4)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result4->num_rows === 0){
          $provides = "<h6>Nothing provided</h6>";
        }else{
          while($row4 = $result4->fetch_assoc()){
            $provides = $provides . "<tr><td style='vertical-align: middle;'>".$row4['name']."</td>
                                     <td style='vertical-align: middle;'>
                                     <a target='_blank' href='provideDetails.php?id=".$row4['id']."' class='w3-btn w3-border w3-small'>Details</a>
                                     </td></tr>";
          }
        }

        $sql5 = "SELECT image,name,email FROM employees WHERE empID = ".$input2;
        if(!$result5 = $mysqli->query($sql5)){
          $mysqli->close();
          die("queryFailed");
        }
        $row5 = $result5->fetch_array(MYSQLI_ASSOC);
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";

        $sql6 = "SELECT * FROM employeesDetails WHERE empID =".$input2;
        if(!$result6 = $mysqli->query($sql6)){
          $mysqli->close();
          die("queryFailed");
        }
        $row6 = $result6->fetch_array(MYSQLI_ASSOC);
        $sql7 = "SELECT groupName FROM employeesGroupDetails WHERE empID =".$input2;
        if(!$result7 = $mysqli->query($sql7)){
          $mysqli->close();
          die("queryFailed");
        }
?>

      <script>
        var counter2=1;
        var groups365Array = [];
        function updateLicenseSubmitted(){
          let flag = false;
          for (let i=0;i<document.getElementsByName('GroupsP[]').length;i++){
            if(document.getElementsByName('GroupsP[]')[i].value.trim().length < 1){
              flag = true;
            }
          }
          if(document.getElementById("Authentication").value == "Enabled" && document.getElementById('TwoFactorOption').checked == false && document.getElementById('AuthenticatorOption').checked == false && document.getElementById('PhoneOption').checked == false){
            alert("Please Select Authentication Type!");
          }else if(flag){
            alert("Please Fill Group Names!");
          }else{
            document.getElementById("updateDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
            var formData = new FormData();
            formData.append("license", document.getElementById("License").value.trim());
            if(document.getElementsByName("projectOption")[0].checked){
              formData.append("msProject", "1");
            }else{
              formData.append("msProject", "0");
            }
            if(document.getElementsByName("powerBiOption")[0].checked){
              formData.append("powerPi", "1");
            }else{
              formData.append("powerPi", "0");
            }
            if(document.getElementById("TwoFactorOption").checked){
              formData.append("authenticationTwoFactor", "1");
            }else{
              formData.append("authenticationTwoFactor", "0");
            }
            if(document.getElementById("AuthenticatorOption").checked){
              formData.append("authenticationAuthenticator", "1");
            }else{
              formData.append("authenticationAuthenticator", "0");
            }
            if(document.getElementById("PhoneOption").checked){
              formData.append("authenticationPhone", "1");
            }else{
              formData.append("authenticationPhone", "0");
            }
            for (var n=0;n<document.getElementsByName('GroupsP[]').length;n++){
              formData.append("groupName[]", document.getElementsByName('GroupsP[]')[n].value.trim());
            }
            formData.append("recipientLimit", document.getElementById("RecipientLimit").value.trim());
            if(document.getElementById("OneDrive").value == "Enabled"){
              formData.append("oneDrive", "1");
            }else{
              formData.append("oneDrive", "0");
            }
            formData.append("mailType", document.getElementById("MailType").value.trim());
            formData.append("mailStorageSize", document.getElementById("MailSize").value.trim());
            if(document.getElementById("MailArchive").value == "Enabled"){
              formData.append("onlineMailboxArchive", "1");
            }else{
              formData.append("onlineMailboxArchive", "0");
            }
            formData.append("onlineArchiveStorageSize", document.getElementById("ArchiveSize").value.trim());
            formData.append("empID", "<?php echo $empID; ?>");
            formData.append("user", "<?php echo $row['id']; ?>");

            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'updateOwnerDetails.php', true);
            xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                document.getElementById("updateHeaderDiv").style.display = "block";
                document.getElementById("updateLicenseInfoDiv").style.display = "none";
                if(xhr.responseText == "added"){
                  document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Updated Successfully!</h3>";
                  setTimeout(function(){
                    location.reload();
                  }, 1000);
                }else{
                  document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                }
              }
            }
            xhr.send(formData);
          }
        }
        function showUpdateLicenseModal(){
          document.getElementById('updateLicenseInfo').style.display='block';
        }
        function setmemorySize(){
          if (document.getElementById('License').value == 'standard' || document.getElementById('License').value == 'basic'){
            document.getElementById('MailSize').value='50GB';
            document.getElementById('ArchiveSize').value="50GB";
          }else{
            document.getElementById('MailSize').value='100GB';
            document.getElementById('ArchiveSize').value='100GB';
          }
        }
        function authenticationoff(){
          if (document.getElementById('Authentication').value == 'Disabled'){
            document.getElementById('TwoFactorOption').disabled = true;
            document.getElementById('AuthenticatorOption').disabled = true;
            document.getElementById('PhoneOption').disabled = true;
            document.getElementById('TwoFactorOption').checked = false;
            document.getElementById('AuthenticatorOption').checked = false;
            document.getElementById('PhoneOption').checked = false;
          }else{
            document.getElementById('TwoFactorOption').disabled = false;
            document.getElementById('AuthenticatorOption').disabled = false;
            document.getElementById('PhoneOption').disabled = false;
          }
        }
        function addNewGroups(){
          let Groups = [];
          let counter = document.getElementsByName('GroupsP[]').length;
          if(counter > 4){
            alert("Too Many Groups!");
          }else{
            for (let i=1;i<document.getElementsByName('GroupsP[]').length;i++){
              Groups.push(document.getElementsByName('GroupsP[]')[i].value);
            }
            document.getElementById("moreGroups").innerHTML = document.getElementById("moreGroups").innerHTML +
            "<input id='gp"+counter2+"' style='display:inline;width:90%;margin-right:6px;' type='text' class='w3-input w3-border w3-margin-bottom' name='GroupsP[]' /><a id='ga"+counter2+"' style='display:inline' class='w3-btn w3-red w3-tiny' onclick='removeGroupP("+counter2+")'>X</a>";
            counter2 = counter2 + 1;
            for (let i=1;i<document.getElementsByName('GroupsP[]').length - 1;i++){
                document.getElementsByName('GroupsP[]')[i].value=Groups[i-1];
              }
            }
          }
        function removeGroupP(index){
          document.getElementById("gp"+index).remove();
          document.getElementById("ga"+index).remove();
        }
        window.onload = function(){
          document.getElementById("License").value = "<?php echo $row6['license']; ?>";
          if ("<?php echo $row6['msProject'];?>" == "1") {
            document.getElementsByName("projectOption")[0].checked = true;
          }
          if ("<?php echo $row6['powerPi'];?>" == "1") {
            document.getElementsByName("powerBiOption")[0].checked = true;
          }
          if ("<?php echo $row6['authenticationTwoFactor'];?>" == "1") {
            document.getElementById("TwoFactorOption").checked = true;
          }
          if ("<?php echo $row6['authenticationAuthenticator'];?>" == "1") {
            document.getElementById("AuthenticatorOption").checked = true;
          }
          if ("<?php echo $row6['authenticationPhone'];?>" == "1") {
            document.getElementById("PhoneOption").checked = true;
          }
          if ("<?php echo $row6['authenticationTwoFactor'];?>" == "0" && "<?php echo $row6['authenticationAuthenticator'];?>" == "0" && "<?php echo $row6['authenticationPhone'];?>" == "0"){
            document.getElementById("Authentication").value = "Disabled";
          }else{
            document.getElementById("Authentication").value = "Enabled";
          }
          authenticationoff();
          document.getElementById("RecipientLimit").value = "<?php echo $row6['recipientLimit']; ?>";
          if ("<?php echo $row6['oneDrive'];?>" == "1") {
            document.getElementById("OneDrive").value = "Enabled";
          }else{
            document.getElementById("OneDrive").value = "Disabled";
          }
          document.getElementById("MailType").value = "<?php echo $row6['mailType']; ?>";
          document.getElementById("MailSize").value = "<?php echo $row6['mailStorageSize']; ?>";
          if ("<?php echo $row6['onlineMailboxArchive'];?>" == "1") {
            document.getElementById("MailArchive").value = "Enabled";
          }else{
            document.getElementById("MailArchive").value = "Disabled";
          }
          document.getElementById("ArchiveSize").value = "<?php echo $row6['onlineArchiveStorageSize']; ?>";
          if(groups365Array.length > 1){
            document.getElementsByName("GroupsP[]")[0].value = groups365Array[0];
            for (var i = 1; i < groups365Array.length; i++) {
              addNewGroups();
              document.getElementsByName("GroupsP[]")[i].value = groups365Array[i];
            }
          }else{
            document.getElementsByName("GroupsP[]")[0].value = groups365Array[0];
          }
        }
      </script>

        <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
          <div class="w3-padding">
            <a class="w3-small w3-btn w3-border" href="employees.php">BACK</a>
          </div>
          <div>
            <div class="w3-container w3-margin">
              <div style="display:inline-block;border-radius:50px;width:100px;height:100px;vertical-align: middle;
                          background:url('http://iss.bfginternational.com/ISS/itemsImages/<?php echo $row5['image']; ?>');
                          background-size:cover;background-position:center;background-color:#eee;">
              </div>
              <h3 class="w3-margin-left" style="display:inline-block;color:#495057;"><?php echo $row5['name']; ?></h3>
            </div>
            <div class="w3-row">
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Assets</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <?php echo $assets; ?>
                </table>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Printers</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <?php echo $printers; ?>
                </table>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Provided</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <?php echo $provides; ?>
                </table>
              </div>
            </div>
            <div class="w3-row"style="margin-top:16px">
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Office 365</i>
                </div>
                  <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                    <tr>
                      <td><b>Email</b></td>
                      <td><?php echo $row5['email']; ?></td>
                    </tr>
                    <tr>
                      <td><b>License</b></td>
                      <td>
                        <?php
                          if($row6['license'] == "standard"){
                            echo "Business Standard"."<br>";
                          }
                          elseif ($row6['license'] == "basic"){
                            echo "Business Basic"."<br>";
                          }
                          elseif ($row6['license'] == "e3"){
                            echo "E3"."<br>";
                          }
                          if($row6['msProject'] == 1){
                            echo "MS Project"."<br>";
                          }
                          if($row6['powerPi'] == 1){
                            echo "Power Bi Pro";
                          }
                          ?></td>
                    </tr>
                    <tr>
                      <td><b>Authentication</b></td>
                      <td>
                       <?php
                          if($row6['authenticationTwoFactor'] == 1){
                            echo "Two Factor"."<br>";
                          }
                          if($row6['authenticationAuthenticator'] == 1){
                            echo "Authenticator"."<br>";
                          }
                          if($row6['authenticationPhone'] == 1){
                            echo "Phone";
                          }
                          if($row6['authenticationTwoFactor'] == 0 && $row6['authenticationAuthenticator'] == 0 && $row6['authenticationPhone'] == 0){
                            echo "Disabled";
                          }
                      ?>
                     </td>
                    </tr><tr>
                      <td><b>Office 365 Groups</b></td>
                      <td>
                        <?php
                          while($row7 = $result7->fetch_assoc()){
                            echo $row7["groupName"]."<br>";
                            echo "<script>groups365Array.push('".$row7["groupName"]."')</script>";
                          }
                        ?>
                      </td>
                    </tr>
                    <tr>
                      <td><b>Recipient Limit</b></td>
                      <td><?php echo $row6['recipientLimit']; ?></td>
                    </tr>
                    <tr>
                      <td><b>One Drive</b></td>
                      <td>
                        <?php if($row6['oneDrive'] == 1){
                          echo "Enabled";
                        }else{
                          echo "Disabled";
                        }
                        ?>
                      </td>
                    </tr>
                    <tr>
                      <td><b>Mail Type</b></td>
                      <td><?php echo $row6['mailType']; ?></td>
                    </tr>
                    <tr>
                      <td><b>Mail Storage Size</b></td>
                      <td><?php echo $row6['mailStorageSize']; ?></td>
                    </tr>
                    <tr>
                      <td><b>Online Mail Archive</b></td>
                      <td>
                        <?php if($row6['onlineMailboxArchive'] == 1){
                          echo "Enabled";
                        }else{
                          echo "Disabled";
                        }
                        ?>
                      </td>
                    </tr>
                    <tr>
                      <td><b>Online Archive Storage Size</b></td>
                      <td><?php echo $row6['onlineArchiveStorageSize']; ?></td>
                    </tr>
                  </table>
                  <a class="w3-btn w3-border w3-small w3-margin-top" onclick="showUpdateLicenseModal()">Update</a>
              </div>
            </div>
          </div>
        </div>

        <div id="updateLicenseInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top" style="width:1100px !important;">
            <div class="w3-container" style="height:660px;overflow:auto;background:#f9f9f9;">
              <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="updateLicenseInfoDiv" class="w3-container w3-margin">
                <h2 class="title">Update License Details</h2>
                <div class="w3-row">
                  <div class="w3-half w3-padding">
                    <p>
                      <label>MS License</label>
                      <select id= "License" class="w3-select w3-padding w3-white w3-border" name="license" style="margin-top:5px;" onchange="setmemorySize()">
                        <option value="standard">Business Standard</option>
                        <option value="basic">Business Basic</option>
                        <option value="e3">E3</option>
                      </select>
                    </p>
                    <p>
                      <label>Other Licenses</label><br>
                      <input type="checkbox" class="w3-check" name="projectOption" style="margin-top: 12px">
                      <label>Microsoft Project</label>
                      <span style="width:37px;display:inline-block;"></span>
                      <input type="checkbox" class="w3-check" name="powerBiOption" style="margin-top: 12px">
                      <label>Power Bi Pro</label><br>
                    </p>
                    <p>
                      <label>Authentication</label>
                      <select id="Authentication" class="w3-select w3-border w3-padding w3-white" style="height:40px;" onchange="authenticationoff()">
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                      <input id="TwoFactorOption"type="checkbox" class="w3-check w3-margin-top" name="TwoFactor">
                      <label>Two Factor</label>
                      <span style="width:37px;display:inline-block;"></span>
                      <input id="AuthenticatorOption"type="checkbox" class="w3-check w3-margin-top" name="Authenticator">
                      <label>Authenticator</label>
                      <span style="width:37px;display:inline-block;"></span>
                      <input id="PhoneOption" type="checkbox" class="w3-check w3-margin-top" name="Phone">
                      <label>Phone</label>
                    </p>
                    <p>
                      <label>Office 365 Groups</label>
                      <input id="OfficeGroups" class="w3-input w3-border" type="text" style="margin-bottom:12px;" name="GroupsP[]" maxlength="100" value="BFG Bahrain List">
                      <div id="moreGroups"></div>
                      <div style="text-align:left;">
                        <a class="w3-small" onclick="addNewGroups()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ Add Group</a>
                      </div>
                    </p>
                  </div>
                  <div class="w3-half w3-padding">
                    <p>
                      <label>Recipient Limit</label>
                      <input id="RecipientLimit" class="w3-input w3-border" type="text" maxlength="50" value="30">
                    </p>
                    <p>
                      <label>One Drive</label>
                      <select id="OneDrive" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </p>
                    <p>
                      <label>Mail Type</label>
                      <select id="MailType" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                        <option value="Default Mailbox">Default Mailbox</option>
                        <option value="Shared Mailbox">Shared Mailbox</option>
                      </select>
                    </p>
                    <p>
                      <label>Mail Storage Size</label>
                      <select id="MailSize" class="w3-select w3-border w3-padding w3-white" style="height:40px;" disabled="">
                        <option value="50GB">50GB</option>
                        <option value="100GB">100GB</option>
                      </select>
                    </p>
                    <p>
                      <label>Online Mailbox Archive</label>
                      <select id="MailArchive" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </p>
                    <p>
                      <label>Online Archive Storage Size</label>
                      <select id="ArchiveSize" class="w3-select w3-border w3-padding w3-white" style="height:40px;" disabled="">
                        <option value="50GB">50GB</option>
                        <option value="100GB">100GB</option>
                      </select>
                    </p>
                    <div id="updateDiv" style="text-align:right;padding-top:22px;">
                      <a onclick="updateLicenseSubmitted()" class="w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateLicenseInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>

        <?php
      }else{
        die("<meta http-equiv='refresh' content='0;url=index.php' />");
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

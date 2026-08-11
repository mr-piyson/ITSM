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
      if(isset($_GET["id"]) && !empty($_GET["id"]) && is_numeric($_GET["id"])){
        $row = $result->fetch_array(MYSQLI_ASSOC);
        $printerID = htmlspecialchars($_GET['id'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $printerID);
        $sql2 = "SELECT * FROM `printers` WHERE `id`=".$input2;
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows === 0){
          die("<meta http-equiv='refresh' content='0;url=index.php' />");
        }else{
          $row2 = $result2->fetch_array(MYSQLI_ASSOC);
        }
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        ?>

        <script>
          function showUpdatePrinterModal(){
            document.getElementById("updateHeaderDiv").style.display = "none";
            document.getElementById("updateHeaderDiv").innerHTML = "";
            document.getElementById("updateDiv").innerHTML = '<a onclick="updatePrinterSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>';
            document.getElementById("updatePrinterGeneralInfoDiv").style.display = "block";
            document.getElementById("printerName").value = '<?php echo $row2["name"]; ?>';
            document.getElementById("printerLocation").value = "<?php echo $row2['location']; ?>";
            document.getElementById("printerUsedBy").value = '<?php echo $row2["usedBy"]; ?>';
            document.getElementById("printerLink").value = '<?php echo $row2["printerLink"]; ?>';
            document.getElementById("printerDepartment").value = '<?php echo $row2["department"]; ?>';
            document.getElementById("updateItemGeneralInfo").style.display = "block";
          }

          function showDeleteItemModa(){
            document.getElementById("deletePrinterGeneralInfo").style.display = "block";
          }

          function updatePrinterSubmitted(){
            if(document.getElementById('printerName').value.trim().length < 1){
              alert("Please fill printer's name !");
            }else{
              document.getElementById("updateDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";

              var formData = new FormData();
              formData.append("name", document.getElementById("printerName").value.trim().replace(/"/g, 'inch'));
              formData.append("location", document.getElementById("printerLocation").value.trim());
              formData.append("usedBy", document.getElementById("printerUsedBy").value.trim());
              formData.append("department", document.getElementById("printerDepartment").value.trim());
              formData.append("link", document.getElementById("printerLink").value.trim());
              formData.append("user", "<?php echo $row['id']; ?>");
              formData.append("printerID", "<?php echo $row2['id']; ?>");
              if(document.getElementById('printerImage').files.length > 0){
                formData.append("file", document.getElementById('printerImage').files[0]);
              }

              var xhr = new XMLHttpRequest();
              xhr.open("POST", 'updatePrinter.php', true);
              xhr.onreadystatechange = function() {
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                  document.getElementById("updateHeaderDiv").style.display = "block";
                  document.getElementById("updatePrinterGeneralInfoDiv").style.display = "none";
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

          function showAddActionModal(){
            document.getElementById("AddActionModal").style.display = "block";
          }

          function printerActionSubmitted(){
            let replacedTonerID = "";
            let tonerFlag = false;
            if(document.getElementsByName("actionType")[0].value == "Replaced" || document.getElementsByName("actionType")[0].value == "Provided"){
              if(document.getElementById("linkedTonersToLink").value.length > 0){
                replacedTonerID = "&replacedToner="+document.getElementById("linkedTonersToLink").value;
                tonerFlag = true;
              }
            }
            if(tonerFlag){
              document.getElementById("actionBtnDiv").style.display = "none";
              document.getElementById("addActionDiv").style.display = "none";
              document.getElementById("updateAddActionHeaderDiv").style.display = "block";
              document.getElementById("updateAddActionHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
              var xhr = new XMLHttpRequest();
              xhr.open("POST", 'addActionPrinter.php', true);
              xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
              xhr.onreadystatechange = function() {
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                  if(xhr.responseText == "added"){
                    document.getElementById("updateAddActionHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Added Successfully!</h3>";
                    setTimeout(function(){
                      location.reload();
                    }, 1000);
                  }else{
                    document.getElementById("updateAddActionHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                  }
                }
              }
              if(document.getElementsByName("actionRequestedBy")[0] && document.getElementsByName("actionReceivedBy")[0]){
                let st = "actionType="+document.getElementsByName("actionType")[0].value;
                st = st + "&actionBy="+document.getElementsByName("actionBy")[0].value+"&actionDate="+document.getElementsByName("actionDate")[0].value+"&actionNote="+document.getElementsByName("actionNote")[0].value+replacedTonerID+"&actionRequestedBy="+document.getElementsByName("actionRequestedBy")[0].value+"&actionReceivedBy="+document.getElementsByName("actionReceivedBy")[0].value+"&user=<?php echo $row['id']; ?>&printerID=<?php echo $row2['id']; ?>";
                xhr.send(st);
              }else{
                xhr.send("actionType="+document.getElementsByName("actionType")[0].value+"&actionBy="+document.getElementsByName("actionBy")[0].value+"&actionDate="+document.getElementsByName("actionDate")[0].value+"&actionNote="+document.getElementsByName("actionNote")[0].value+replacedTonerID+"&user=<?php echo $row['id']; ?>&printerID=<?php echo $row2['id']; ?>");
              }
            }else{
              alert("No Toner Selected !");
            }
          }

          function actionTypeChanged(){
            if(document.getElementsByName("actionType")[0].value == "Replaced" || document.getElementsByName("actionType")[0].value == "Provided"){
              document.getElementById("linkedTonersToLinkP").style.display = "block";
            }else{
              document.getElementById("linkedTonersToLinkP").style.display = "none";
            }
          }
        </script>

        <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
          <div class="w3-padding">
            <a class="w3-small w3-btn w3-border" href="printers.php">BACK</a>
          </div>
          <div>
            <h1 class="w3-padding title">Printer Details</h1>
            <div class="w3-padding">
              <a class="w3-btn w3-border w3-small" onclick="showAddActionModal()">Add Action</a>
              <a class="w3-btn w3-border w3-small" onclick="showUpdatePrinterModal()">Update</a>
              <a class="w3-btn w3-border w3-small" onclick="showDeleteItemModa()">Delete</a>
              <a href="allActionLogs.php?id=<?php echo $row2['id']; ?>" class="w3-btn w3-border w3-small">All Action Logs</a>
            </div>
            <div class="w3-row">
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>General Information</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td><b>Name</b></td>
                    <td><?php echo $row2["name"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Location</b></td>
                    <td><?php echo $row2["location"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Department</b></td>
                    <td><?php echo $row2["department"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Used By</b></td>
                    <td><?php echo $row2["usedBy"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Link</b></td>
                    <td><a target="_blank" href='http://<?php echo $row2["printerLink"]; ?>'><?php echo $row2["printerLink"]; ?></a></td>
                  </tr>
                  <?php if(!empty($row2["img"])){ ?>
                  <tr>
                    <td colspan="2"><img style="width:100%;max-width:350px;" src="http://iss.bfginternational.com/ISS/printersImages/<?php echo $row2['img']; ?>" /></td>
                  </tr>
                  <?php } ?>
                </table>
                <?php
                  $rollPrinter = false;
                  $sql4 = "SELECT * FROM `printerInfo` WHERE `printerID`=".$row2["id"];
                  if(!$result4 = $mysqli->query($sql4)){
                    $mysqli->close();
                    die("queryFailed");
                  }
                  if ($result4->num_rows > 0){
                    $row4 = $result4->fetch_array(MYSQLI_ASSOC);
                    echo '<div class="w3-card-2 w3-border w3-padding w3-margin-top" style="background:#eefafd;"><i>Printer Info</i></div>';
                    echo "<table class='w3-table w3-table-all w3-card-2 w3-margin-top w3-margin-bottom w3-small'>";
                    if(!empty($row4['manufacturer'])){
                      echo "<tr><td><b>Manufacturer</b></td><td>".$row4['manufacturer']."</td></tr>";
                    }
                    if(!empty($row4['model'])){
                      echo "<tr><td><b>Model</b></td><td>".$row4['model']."</td></tr>";
                    }
                    if(!empty($row4['serialNumber'])){
                      echo "<tr><td><b>Serial Number</b></td><td>".$row4['serialNumber']."</td></tr>";
                    }
                    if(!empty($row4['firmware'])){
                      echo "<tr><td><b>Firmware</b></td><td>".$row4['firmware']."</td></tr>";
                    }
                    if($row4['RFID'] == 0){
                      echo "<tr><td><b>RFID</b></td><td>No</td></tr>";
                    }else{
                      echo "<tr><td><b>RFID</b></td><td>Yes</td></tr>";
                    }
                    if(!empty($row4['darkness'])){
                      echo "<tr><td><b>Darkness</b></td><td>".$row4['darkness']."</td></tr>";
                    }
                    if(!empty($row4['printSpeed'])){
                      echo "<tr><td><b>Print Speed</b></td><td>".$row4['printSpeed']."</td></tr>";
                    }
                    if(!empty($row4['tearOffAdjust'])){
                      echo "<tr><td><b>Tear Off Adjust</b></td><td>".$row4['tearOffAdjust']."</td></tr>";
                    }
                    if(!empty($row4['printMode'])){
                      echo "<tr><td><b>Print Mode</b></td><td>".$row4['printMode']."</td></tr>";
                    }
                    if(!empty($row4['mediaType'])){
                      echo "<tr><td><b>Media Type</b></td><td>".$row4['mediaType']."</td></tr>";
                    }
                    if(!empty($row4['sensorSelect'])){
                      echo "<tr><td><b>Sensor Select</b></td><td>".$row4['sensorSelect']."</td></tr>";
                    }
                    if(!empty($row4['printMethod'])){
                      echo "<tr><td><b>Print Method</b></td><td>".$row4['printMethod']."</td></tr>";
                    }
                    if(!empty($row4['printWidth'])){
                      echo "<tr><td><b>Print Width</b></td><td>".$row4['printWidth']."</td></tr>";
                    }
                    if(!empty($row4['labelLength'])){
                      echo "<tr><td><b>Label Length</b></td><td>".$row4['labelLength']."</td></tr>";
                    }
                    if(!empty($row4['labelTop'])){
                      echo "<tr><td><b>Label Top</b></td><td>".$row4['labelTop']."</td></tr>";
                    }
                    if(!empty($row4['leftPosition'])){
                      echo "<tr><td><b>Left Position</b></td><td>".$row4['leftPosition']."</td></tr>";
                    }
                    echo "</table>";
                    $rollPrinter = true;
                  }
                ?>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Printer Action</i>
                </div>
                <?php
                  $sql3 = " SELECT pa.id,pa.printerID,pa.actionType,pa.actionDate,pa.actionBy,pa.note,pa.itemID,pa.requestedBy,pa.recievedBy,i.name
                            FROM printerActions pa
                            LEFT JOIN items i
                            ON i.id = pa.itemID
                            WHERE pa.printerID =".$row2["id"]." ORDER BY pa.actionDate DESC LIMIT 10";
                  if(!$result3 = $mysqli->query($sql3)){
                    die("queryFailed");
                  }
                  if ($result3->num_rows === 0){
                    echo "<table class='w3-table w3-table-all w3-card-2 w3-margin-top'><tr><td>No Actions<td></tr></table>";
                  }else{
                    while($row3 = $result3->fetch_assoc()){
                      echo "<table class='w3-table w3-table-all w3-card-2 w3-margin-top w3-small'>";
                      $tagColor = "";
                      $itemReplaced = "";
                      if ($row3['actionType'] == "Replaced") {
                        $tagColor = "w3-blue";
                        $itemReplaced = $row3['name'];
                      }elseif($row3['actionType'] == "Provided"){
                        $tagColor = "w3-indigo";
                        $itemReplaced = $row3['name'];
                      }elseif($row3['actionType'] == "Checked"){
                        $tagColor = "w3-yellow";
                      }elseif($row3['actionType'] == "Serviced"){
                        $tagColor = "w3-green";
                      }elseif($row3['actionType'] == "Cleaned"){
                        $tagColor = "w3-teal";
                      }elseif($row3['actionType'] == "Recieved"){
                        $tagColor = "w3-orange";
                      }
                      if ($row3['actionType'] == "Replaced" || $row3['actionType'] == "Provided") {
                        echo "<tr><td><b>Type</b></td><td><span class='w3-padding-small ".$tagColor."'>".$row3['actionType']."</span></td><td><b>Date</b></td><td>".$row3['actionDate']."</td><td><b>Action By</b></td><td>".$row3['actionBy']."</td><tr><td><b>Replaced Toner</b></td><td colspan='5'>".$row3['name']."</td></tr><tr><td><b>Note</b></td><td colspan='5'>".$row3['note']."</td></tr>";
                        if($rollPrinter){
                          echo "<tr><td><b>Requested By</b></td><td colspan='2'>".$row3['requestedBy']."</td><td><b>Received By</b></td><td colspan='2'>".$row3['recievedBy']."</td></tr>";
                        }
                      }else{
                        echo "<tr><td><b>Type</b></td><td><span class='w3-padding-small ".$tagColor."'>".$row3['actionType']."</span></td><td><b>Date</b></td><td>".$row3['actionDate']."</td><td><b>Action By</b></td><td>".$row3['actionBy']."</td><tr><td><b>Note</b></td><td colspan='5'>".$row3['note']."</td></tr>";
                      }
                      echo "</table>";
                    }
                  }
                ?>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Linked Toners/Rolls</i>
                </div>
                <?php
                  $linkedToners = array();
                  $sql3 = "SELECT i.name,i.brand,i.img,i.id,i.stock FROM printersToners pt
                           LEFT JOIN items i
                           ON i.id = pt.tonerID
                           WHERE pt.PrinterID =".$row2["id"]." AND i.inActive = 0";
                  if(!$result3 = $mysqli->query($sql3)){
                    die("queryFailed");
                  }
                  if ($result3->num_rows === 0){
                    echo "<table class='w3-table w3-table-all w3-card-2 w3-margin-top'><tr><td>No Linked Toners/Rolls<td></tr></table>";
                  }else{
                    while($row3 = $result3->fetch_assoc()){
                      $linkedToners[] = $row3;
                      echo "<table class='w3-table w3-table-all w3-card-2 w3-margin-top w3-small'>";
                      if(!empty($row3['img'])){
                        ?>
                        <tr>
                          <td colspan="2">
                            <div style="height:80px;background:url('http://iss.bfginternational.com/ISS/itemsImages/<?php echo $row3['img']; ?>');background-position:center;background-size:cover;"></div>
                          </td>
                        </tr>
                        <?php
                      }
                      if($row3['stock'] > 0){
                        $stockColor = "green";
                      }else{
                        $stockColor = "red";
                      }
                      echo "<tr><td><b>Name</b></td><td>".$row3['name']."</td><tr><td><b>Brand</b></td><td>".$row3['brand']."</td></tr><tr><td><b>Stock</b></td><td><span class='w3-padding-small w3-".$stockColor."'>".$row3['stock']."</span></td></tr>";
                      echo "<tr><td colspan='2'><a target='_blank' href='itemDetails.php?id=".$row3['id']."' class='w3-btn w3-border w3-white'>Details</a></td></tr>";
                      echo "</table>";
                    }
                  }
                ?>
              </div>
            </div>
          </div>
        </div>

        <div id="updateItemGeneralInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:650px;overflow:auto;background:#f9f9f9;">
              <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="updatePrinterGeneralInfoDiv" class="w3-container w3-margin">
                <h2 class="title">Update Printer Details</h2>
                <p>
                  <label>Name</label>
                  <input id="printerName" class="w3-input w3-border" type="text" maxlength="100">
                </p>
                <p>
                  <label>Location</label>
                  <input id="printerLocation" class="w3-input w3-border" type="text" maxlength="100">
                </p>
                <p>
                  <label>Department</label>
                  <input id="printerDepartment" class="w3-input w3-border" type="text" maxlength="100">
                </p>
                <p>
                  <label>Used By</label>
                  <input id="printerUsedBy" class="w3-input w3-border" type="text" maxlength="100">
                </p>
                <p>
                  <label>Link</label>
                  <input id="printerLink" class="w3-input w3-border" type="text" maxlength="50">
                </p>
                <p>
                  <label>Image</label>
                  <input id="printerImage" class="w3-input w3-border" type="file" accept="image/*">
                </p>
                <div id="updateDiv">
                  <a onclick="updatePrinterSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>
                </div>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateItemGeneralInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>

        <div id="deletePrinterGeneralInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
              <div class="w3-container w3-margin">
                <h2 class="title">Delete Printer</h2>
                <h4>Are You Sure Do You Want to Delete This Printer?</h4>
                <form action="deletePrinter.php" method="post">
                  <input type="hidden" name="printerID" value="<?php echo $row2['id']; ?>">
                  <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
                  <input class="w3-brown w3-btn" type="submit" value="Delete">
                </form>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('deletePrinterGeneralInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>

        <div id="AddActionModal" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:650px;overflow:auto;background:#f9f9f9;">
              <div id="updateAddActionHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="addActionDiv" class="w3-container w3-margin">
                <h2 class="title">Add Printer Action</h2>
                <p>
                  <label>Acrion Type</label>
                  <select onchange="actionTypeChanged()" class="w3-select w3-border w3-padding w3-white" name="actionType">
                    <?php //if(!$rollPrinter){ ?>
                      <option value="Replaced">Replaced</option>
                    <?php //}else{ ?>
                      <option value="Provided">Provided</option>
                    <?php //} ?>
                    <option value="Checked">Checked</option>
                    <option value="Serviced">Serviced</option>
                    <option value="Cleaned">Cleaned</option>
                    <option value="Recieved">Recieved</option>
                  </select>
                </p>
                <p>
                  <label>Action By</label>
                  <select class="w3-select w3-border w3-padding w3-white" name="actionBy">
                    <option value="Hadi Almahari">Hadi Almahari</option>
                    <option value="Salman Almosawi">Salman Almosawi</option>
                  </select>
                </p>
                <p>
                  <label>Action Date</label>
                  <input class="w3-input w3-border" type="date" name="actionDate" value="<?php echo date('Y-m-d'); ?>">
                </p>
                <p>
                  <label>Note</label>
                  <input class="w3-input w3-border" type="text" name="actionNote" maxlength="100">
                </p>
                <p id="linkedTonersToLinkP">
                  <label>Available Toners</label>
                  <select id="linkedTonersToLink" class="w3-select w3-padding w3-white w3-border">
                    <?php
                      for ($v=0;$v<count($linkedToners);$v++){
                        if($linkedToners[$v]["stock"] > 0){
                          echo "<option value='".$linkedToners[$v]["id"]."'>".$linkedToners[$v]["name"]."</option>";
                        }
                      }
                    ?>
                  </select>
                </p>
                <?php if($rollPrinter){ ?>
                  <p>
                    <label>Requested By</label>
                    <input class="w3-input w3-border" type="text" name="actionRequestedBy" maxlength="50">
                  </p>
                  <p>
                    <label>Received By</label>
                    <input class="w3-input w3-border" type="text" name="actionReceivedBy" maxlength="50">
                  </p>
                <?php } ?>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('AddActionModal').style.display='none'">Close</div>
              <div id="actionBtnDiv" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="printerActionSubmitted()">Add Action</div>
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

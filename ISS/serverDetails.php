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
    if(isset($_GET["server"]) && !empty($_GET["server"])){
      $row = $result->fetch_array(MYSQLI_ASSOC);
      $id = htmlspecialchars($_GET['server'], ENT_QUOTES);;
      $input2 = mysqli_real_escape_string($mysqli, $id);
      $sql2 = "SELECT * FROM `servers` WHERE `serverID`=".$input2;
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if($result2->num_rows > 0){
        $row2 = $result2->fetch_array(MYSQLI_ASSOC);
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      }
      ?>
      <script>
      function RevealHiddenOverflowDesc(){
        if(document.getElementsByName("truncate1")[0].style.whiteSpace == 'nowrap'){
          document.getElementsByName("truncate1")[0].style.whiteSpace = 'normal';
        }else{
          document.getElementsByName("truncate1")[0].style.whiteSpace = 'nowrap';
        }
      }
      function RevealHiddenOverflowNote(){
        if(document.getElementsByName("truncate2")[0].style.whiteSpace == 'nowrap'){
          document.getElementsByName("truncate2")[0].style.whiteSpace = 'normal';
        }else{
          document.getElementsByName("truncate2")[0].style.whiteSpace = 'nowrap';
        }
      }
      function RevealOverflowActionDesc(){
        if(document.getElementsByName("truncate3")[0].style.whiteSpace == 'nowrap'){
          document.getElementsByName("truncate3")[0].style.whiteSpace = 'normal';
        }else{
          document.getElementsByName("truncate3")[0].style.whiteSpace = 'nowrap';
        }
      }
      function showDeleteServerModal(){
        document.getElementById('deleteServerInfo').style.display='block';
      }
      function showUpdateServerModal(){
        document.getElementById('updateServerInfo').style.display='block';
      }
      function diskModalChange(){
        console.log(document.getElementById('DiskAmount').value);
        if (document.getElementById('DiskAmount').value == '1'){
          document.getElementById('sizeToggle0').style.display='inline';
          document.getElementById('typeToggle0').style.display='inline';
          document.getElementById('locationToggle0').style.display='inline';

          document.getElementById('sizeToggle1').style.display='none';
          document.getElementById('typeToggle1').style.display='none';
          document.getElementById('locationToggle1').style.display='none';
          document.getElementById('sizeToggle2').style.display='none';
          document.getElementById('typeToggle2').style.display='none';
          document.getElementById('locationToggle2').style.display='none';
        }else{
          document.getElementById('sizeToggle0').style.display='none';
          document.getElementById('typeToggle0').style.display='none';
          document.getElementById('locationToggle0').style.display='none';

          document.getElementById('sizeToggle1').style.display='inline';
          document.getElementById('typeToggle1').style.display='inline';
          document.getElementById('locationToggle1').style.display='inline';
          document.getElementById('sizeToggle2').style.display='inline';
          document.getElementById('typeToggle2').style.display='inline';
          document.getElementById('locationToggle2').style.display='inline';
        }
      }
      window.onload = function(){
        document.getElementById("DiskAmount").value = "<?php echo $row2['diskAmount']; ?>";
        diskModalChange();
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
          color:#1a61a3;
          margin: 0 !important;
          background: #f7f1ef !important;
        }
        h5{
          color:#0b5266;
          margin: 0 !important;
          font-size: 16px;
          font-family: Verdana,sans-serif;
          font-weight: bold;
          line-height: 1.5;
        }
        </style>
        <div class='w3-container w3-padding' style="padding-bottom:40px !important;">
          <div class='w3-padding'>
            <a class='w3-small w3-btn w3-border' href='serversList.php'>BACK</a>
          </div>
        <div>
          <h1 class='w3-padding title'>Server Details</h1>
          <div class="w3-padding">
            <a class="w3-btn w3-border w3-small" onclick="showUpdateServerModal()">Update Server</a>
            <a class="w3-btn w3-border w3-small" onclick="showDeleteServerModal()">Delete Server</a>
            <a class="w3-btn w3-border w3-small w3-right" href="serverActionsLog.php?server=<?php echo $row2['serverID']; ?>">Server Actions Log</a>
          </div>
          <div class="w3-row">
            <div class="w3-padding w3-third">
              <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                <i>General Information</i>
              </div>
              <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                <tr>
                  <td><b>Unique ID</b></td>
                  <td><?php echo $row2["serverID"]; ?></td>
                </tr>
                <tr>
                  <td><b>Type</b></td>
                  <td><?php echo ucfirst($row2["type"]); ?></td>
                </tr>
                <tr>
                  <td><b>Status</b></td>
                  <?php
                    echo "<td>";
                   if($row2["maintenanceDue"] < date('Y-m-d')){
                     echo "<span class='w3-tag w3-amber'>Maintenance Required</span>";
                   }elseif($row2["serverStatus"] == "active"){
                     echo "<span class='w3-tag w3-green'>".ucfirst($row2['serverStatus'])."</span>";
                   }else{
                     echo "<span class='w3-tag w3-red'>".ucfirst($row2['serverStatus'])."</span>";
                   }
                   echo "</td>";
                    // echo "<td>";
                    // if($row2["serverStatus"] == "active"){
                    //   echo "<span class='w3-tag w3-green'>".ucfirst($row2['serverStatus'])."</span>";
                    // }else{
                    //   echo "<span class='w3-tag w3-red'>".ucfirst($row2['serverStatus'])."</span>";
                    // }
                    // echo "</td>";
                  ?>
                </tr>
                <tr>
                  <td><b>Host</b></td>
                  <td><?php echo $row2["host"]; ?></td>
                </tr>
                <tr>
                  <td><b>Host IP</b></td>
                  <td><?php echo $row2["hostIP"]; ?></td>
                </tr>
                <tr>
                  <td><b>Last Maintenance</b></td>
                  <td><?php echo date('m-d-Y', strtotime($row2['maintenanceLast'])); ?></td>
                </tr>
                <tr>
                  <td><b>Next Maintenance</b></td>
                  <td><?php echo date('m-d-Y', strtotime($row2['maintenanceDue'])); ?></td>
                </tr>
              </table>
              <div class="w3-card-2 w3-border w3-padding w3-margin-top" style="background:#eefafd;">
                <i>Server Notes</i>
              </div>
              <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                <tr>
                  <td><b>Applications</b></td>
                  <td><?php echo ucfirst($row2['Applications']); ?></td>
                </tr>
                <tr>
                  <td><b>Description</b></td>
                  <td class='truncate1' onclick="RevealHiddenOverflowDesc()" style='cursor: pointer;max-width:275px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;'><?php echo ucfirst($row2['descrip']); ?></td>
                </tr>
                <tr>
                  <td><b>Notes</b></td>
                  <td class='truncate2' onclick="RevealHiddenOverflowNote()" style='cursor: pointer;max-width:275px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;'><?php echo ucfirst($row2['notes']); ?></td>
                </tr>
              <?php //if(!empty($row2["image"])){ ?>
                <!-- <tr>
                  <td colspan="2"><img style="width:100%;width:350px;" src="http://iss.bfginternational.com/ISS/itemsImages/<?php //echo $row2['image']; ?>" /></td>
                </tr> -->
                <?php //} ?>
              </table>
            </div>
          <div class="w3-third w3-padding">
            <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
              <i>Server Specs</i>
            </div>
            <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
              <tr>
                <td><b>VMware Server Name</b></td>
                <td><?php echo ucfirst($row2['name']); ?></td>
              </tr>
              <tr>
                <td><b>VM Server IP</b></td>
                <td><?php echo $row2['serverIP']; ?></td>
              </tr>
              <tr>
                <td><b>OS</b></td>
                <td><?php echo ucfirst($row2['os']); ?></td>
              </tr>
              <tr>
                <td><b>CPU</b></td>
                <td><?php echo $row2['cpu']; ?></td>
              </tr>
              <tr>
                <td><b>RAM</b></td>
                <td><?php echo $row2['ram']; ?></td>
              </tr>
              <tr>
                <td><b>Number of Disks</b></td>
                <td><?php echo $row2['diskAmount']; ?></td>
              </tr>
              <?php
              if (!empty($row2['disk2'])){
                echo "<tr>
                <td><b>Disk 1 Size</b></td>
                <td>".$row2['disk']."</td>
                </tr>
                <tr>
                <td><b>Disk 2 Size</b></td>
                <td>".$row2['disk2']."</td>
                </tr>";
              }else{
                echo "<tr>
                <td><b>Disk Size</b></td>
                <td>".$row2['disk']."</td>
                </tr>";
              }
               if (!empty($row2['diskType2'])){
                echo "<tr>
                <td><b>Disk 1 Type</b></td>
                <td>".$row2['diskType']."</td>
                </tr>
                <tr>
                <td><b>Disk 2 Type</b></td>
                <td>".$row2['diskType2']."</td>
                </tr>";
              }else{
                echo "<tr>
                <td><b>Disk Type</b></td>
                <td>".$row2['diskType']."</td>
                </tr>";
              }
              if (!empty($row2['location2'])){
                echo "<tr>
                <td><b>Storage 1 Location</b></td>
                <td>".$row2['location']."</td>
                </tr>
                <tr>
                <td><b>Storage 2 Location</b></td>
                <td>".$row2['location2']."</td>
                </tr>";
              }else{
                echo "<tr>
                <td><b>Storage Location</b></td>
                <td>".$row2['location']."</td>
                </tr>";
              }
              ?>
              <tr>
                <td><b>Backup</b></td>
                <td><?php echo ucfirst($row2['backupStatus']); ?></td>
              </tr>
              <tr>
                <td><b>Backup Software</b></td>
                <td><?php echo ucfirst($row2['backupSoftware']); ?></td>
              </tr>
            </table>
          </div>
          <?php
          $sql3 = "SELECT * FROM `serverActions` WHERE `serverID`=".$input2." ORDER BY actionDate DESC LIMIT 10";
          if(!$result3 = $mysqli->query($sql3)){
            $mysqli->close();
            die("queryFailed");
          }
          $counter = 0;
          echo "<div class='w3-third w3-padding'><div class='w3-card-2 w3-border w3-padding' style='background:#eefafd;'><i>Latest Actions</i></div><table class='w3-table w3-table-all w3-card-2 w3-margin-top'><tr>
            <td><strong><i>Action</i></strong></td><td><td><strong><i>Date</i></strong></td></tr>";
          if($result3->num_rows > 0){
            while($row3 = $result3->fetch_assoc()){
              echo "<tr><td>".$row3['actionType']."</td><td></td>";
              echo "<td>".(date('m-d-Y H:i a', strtotime($row3['actionDate'])))."</td>";
            }
            echo "</tr></table></div>";
          }
          ?>
      </div>
    </div>
  </div>
  <div id="deleteServerInfo" class="w3-modal">
    <div class="w3-modal-content w3-animate-top">
      <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
        <div class="w3-container w3-margin">
          <h2 class="title w3-margin-bottom">Delete Server</h2><br>
          <h3>Are you sure you want to delete this server?</h3><br><br>
          <form action="deleteServer.php" method="post">
            <input type="hidden" name="serverID" value="<?php echo $row2['serverID']; ?>">
            <input type="hidden" name="user" value="<?php echo $row['id'] ?>">
            <input class="w3-btn w3-margin-top" type="submit" value="Delete">
          </form>
        </div>
      </div>
      <div class="w3-container w3-light-grey w3-padding">
        <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('deleteServerInfo').style.display='none'">Close</div>
      </div>
    </div>
  </div>
  <div id="updateServerInfo" class="w3-modal">
    <div class="w3-modal-content w3-animate-top" style="width:62.5vw !important;">
      <div class="w3-container" style="height:79vh;overflow:auto;background:#f9f9f9;">
        <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
        <div id="updateServerInfoDiv" class="w3-container w3-margin">
          <h2 class="title">Update Server Details</h2>
          <div class="w3-row">
            <form action="updateServer.php" method="post" enctype="multipart/form-data">
              <input type="hidden" name="serverID" value="<?php echo $row2['serverID']; ?>">
            <div class="w3-third w3-padding">
              <p>
                <label>Type</label>
                <select name="ServerType" class="w3-select w3-border w3-padding w3-white" style="height:40px;" value="<?php echo $row2['type']; ?>">
                  <option value="virtual">Virtual</option>
                  <option value="physical">Physical</option>
                </select>
              </p>
              <p>
                <label>Server Status</label>
                <select name="ServerStatus" class="w3-select w3-border w3-padding w3-white" style="height:40px;" value="<?php echo $row2['serverStatus']; ?>">
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </p>
              <p>
                <label>Host</label>
                <select name="host" class="w3-select w3-border w3-padding w3-white" style="height:40px;" value="<?php echo $row2['host']; ?>">
                  <option value="VMHost 1">VMHost 1</option>
                  <option value="VMHost 2">VMHost 2</option>
                </select>
              <p>
                <label>Host IP</label>
                <input name="HostIP" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['hostIP']; ?>">
              </p>
              <p>
                <label>Last Maintenance</label>
                <input name="LastMainten" class="w3-input w3-border" type="date" value="<?php echo date('Y-m-d', strtotime($row2['maintenanceLast'])); ?>">
              </p>
              <p>
                <div style="display:inline-block;width:330px;">
                <label>Next Maintenance Period</label>
                <br>
                <select name="NextPeriod" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                  <option value="30days">30 Days</option>
                  <option value="60days">60 Days</option>
                  <option value="90days">90 Days</option>
                </select>
                <p>
                  <label>Notes</label>
                  <textarea name="Notes" class="w3-input w3-border" type="text" maxlength="200" style="resize:none;"><?php echo $row2['notes']; ?></textarea>
                </p>
              </div>
              </p>
            </div>
            <div class="w3-third w3-padding">
              <p>
                <label>VMware Server Name</label>
                <input name="ServerName" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['name']; ?>">
              </p>
              <p>
                <label>VMware Server IP Address</label>
                <input name="ServerIP" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['serverIP']; ?>">
              </p>
              <p>
                <label>OS</label>
                <input name="ServerOS" class="w3-input w3-border" type="text" maxlength="100" value="<?php echo $row2['os']; ?>">
              </p>
              <p>
                <label>CPU</label>
                <input name="Cpu" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['cpu']; ?>">
              </p>
              <p>
                <label>RAM</label>
                <input name="Ram" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['ram']; ?>">
              </p>
              <p>
                <label>Applications</label>
                <input name="Applications" class="w3-input w3-border" type="text" maxlength="100" value="<?php echo $row2['Applications']; ?>">
              </p>
              <p>
                <label>Description</label>
                <textarea name="Description" class="w3-input w3-border" type="text" maxlength="200" style="resize:none;"><?php echo $row2['descrip']; ?></textarea>
              </p>
            </div>
            <div class="w3-third w3-padding">
              <p>
                <label>Number of Disks</label>
                <select id="DiskAmount" name="DiskAmount" class="w3-input w3-border" onchange="diskModalChange()" type="text" maxlength="50" style="height: 40.5px; margin-bottom: 15px;">
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </p>
              <p id="sizeToggle0" style="display:inline;">
                <label>Disk Size</label>
                <input name="DiskSize" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['disk']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="sizeToggle1" style="display:none;">
                <label>Disk 1 Size</label>
                <input name="DiskSize" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['disk']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="sizeToggle2" style="display:none;">
                <label>Disk 2 Size</label>
                <input name="DiskSize2" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['disk2']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="typeToggle0" style="display:inline;">
                <label>Disk Type</label>
                <input name="DiskType" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['diskType']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="typeToggle1" style="display:none;">
                <label>Disk 1 Type</label>
                <input name="DiskType" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['diskType']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="typeToggle2" style="display:none;">
                <label>Disk 2 Type</label>
                <input name="DiskType2" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['diskType2']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="locationToggle0" style="display:inline;">
                <label>Storage Location</label>
                <input name="Location" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['location']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="locationToggle1" style="display:none;">
                <label>Storage 1 Location</label>
                <input name="Location" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['location']; ?>" style="margin-bottom: 15px;">
              </p>
              <p id="locationToggle2" style="display:none;">
                <label>Storage 2 Location</label>
                <input name="Location2" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['location2']; ?>" style="margin-bottom: 15px;">
              </p>
              <p>
                <label>Backup</label>
                <select name="BackupStatus" class="w3-select w3-border w3-padding w3-white" style="height:40px;" value="<?php echo $row2['backupStatus']; ?>">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </p>
              <p>
                <label>Backup Software</label>
                <input name="BackupSoftware" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['backupSoftware']; ?>">
              </p>
              <p>
                <label>Image</label>
                <input name="serverImage" class="w3-input w3-border" type="file" accept="image/*">
              </p>
              <input type="hidden" name="user" value="<?php echo $row["id"]; ?>">
              <div id="updateDiv" style="text-align:right;padding-top:22px;">
                <input type="submit" class="w3-btn" style="background:#128cae;color:#fff;" value="UPDATE" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="w3-container w3-light-grey w3-padding">
      <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateServerInfo').style.display='none'">Close</div>
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

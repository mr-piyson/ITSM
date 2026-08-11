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
      date_default_timezone_set('Asia/Bahrain');
        $row = $result->fetch_array(MYSQLI_ASSOC);
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<div class='w3-container w3-padding'>";
        echo "<div class='w3-padding w3-margin-top'>";
        echo "<a class='w3-small w3-btn w3-border' href='home.php'>BACK</a>";
        echo "</div>";
        echo "<h1 class='w3-padding title'>Server List</h1>";
        echo "<div class='w3-row w3-padding w3-right'>";
        echo "<a class='w3-btn w3-border w3-small' onclick='showAddNewServerModal()'>Add New Server</a>";
        echo "</div>";
        ?>
        <script>
        var serverIPForSearch = [];
        var serverTypeForSearch = [];
        var serverOSForSearch = [];
        // function serverSearch(e){
        //   if ((document.getElementById('serverSearchInput').value.trim().length > 1)){
        //     for (let x=0;x<document.getElementsByClassName('serverBlocks').length;x++){
        //       document.getElementsByClassName('serverBlocks')[x].style.display = "none";
        //     }
        //     var counter = 0;
        //     for (var i=0;i<serverIPForSearch.length;i++){
        //       if(serverIPForSearch[i].toUpperCase().includes(document.getElementById("serverSearchInput").value.trim().toUpperCase()) ||
        //          serverTypeForSearch[i].toUpperCase().includes(document.getElementById("serverSearchInput").value.trim().toUpperCase()) ||
        //          serverOSForSearch[i].toUpperCase().includes(document.getElementById("serverSearchInput").value.trim().toUpperCase()) ||
        //        ){
        //          for (let n=0;n<document.getElementsByClassName('serverBlocks').length;n++){
        //            if(n == i){
        //              document.getElementsByClassName('serverBlocks')[n].style.display = "block";
        //              counter = counter + 1;
        //            }
        //          }
        //        }
        //     }
        //   }else{
        //     for (let x=0;x<document.getElementsByClassName('serverBlocks').length;x++){
        //       document.getElementsByClassName('serverBlocks')[x].style.display = "blocks";
        //     }
        //   }
        // }
        function showAddNewServerModal(){
          document.getElementById('addNewServerInfo').style.display='block';
        }
        </script>
        <div class="w3-margin-top w3-padding">
          <label style="color:#0b5266;">Search</label>
          <input id="serverSearchInput" onkeyup="serverSearch(event)" type="text" class="w3-input w3-border">
        </div>

        <div id="addNewServerInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top" style="width:62.5vw !important;">
            <div class="w3-container" style="height:79vh;overflow:auto;background:#f9f9f9;">
              <div id="addNewHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="addNewServerInfoDiv" class="w3-container w3-margin">
                <h2 class="title">New Server Details</h2>
                <div class="w3-row">
                  <form action="addNewServer.php" method="post">
                    <div class="w3-third w3-padding">
                      <p>
                        <label>Type</label>
                        <select name="ServerType" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                          <option value="virtual">Virtual</option>
                          <option value="physical">Physical</option>
                        </select>
                      </p>
                      <p>
                        <label>Server Status</label>
                        <select name="ServerStatus" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                          <option value="active">Active</option>
                          <option value="discontinued">Discontinued</option>
                        </select>
                      </p>
                      <p>
                        <label>Host</label>
                        <select name="host" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                          <option value="VMHost 1">VMHost 1</option>
                          <option value="VMHost 2">VMHost 2</option>
                        </select>
                      <p>
                        <label>Host IP</label>
                        <input name="HostIP" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>Last Maintenance</label>
                        <input name="LastMainten" class="w3-input w3-border" type="date" value="<?php echo date('Y-m-d'); ?>">
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
                      </div>
                      </p>
                    </div>
                    <div class="w3-third w3-padding">
                      <p>
                        <label>VMware Server Name</label>
                        <input name="ServerName" class="w3-input w3-border" type="text" maxlength="100">
                      </p>
                      <p>
                        <label>VMware Server IP Address</label>
                        <input name="ServerIP" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>OS</label>
                        <input name="ServerOS" class="w3-input w3-border" type="text" maxlength="100">
                      </p>
                      <p>
                        <label>CPU</label>
                        <input name="Cpu" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>RAM</label>
                        <input name="Ram" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>Description</label>
                        <textarea name="Description" class="w3-input w3-border" type="text" maxlength="200" style="resize:none;"></textarea>
                      </p>
                      <p>
                        <label>Notes</label>
                        <textarea name="Notes" class="w3-input w3-border" type="text" maxlength="200" style="resize:none;"></textarea>
                      </p>
                    </div>
                    <div class="w3-third w3-padding">
                      <p>
                        <label>Disk Size</label>
                        <input name="DiskSize" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>Disk Type</label>
                        <input name="DiskType" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>Number of Disks</label>
                        <input name="DiskAmount" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>Storage Location</label>
                        <input name="Location" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>Backup</label>
                        <select name="BackupStatus" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </p>
                      <p>
                        <label>Backup Software</label>
                        <input name="BackupSoftware" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <p>
                        <label>Applications</label>
                        <input name="Applications" class="w3-input w3-border" type="text" maxlength="50">
                      </p>
                      <input type="hidden" name="user" value="<?php echo $row["id"]; ?>">
                      <div id="addDiv" style="text-align:right;padding-top:22px;">
                        <input type="submit" class="w3-btn" style="background:#128cae;color:#fff;" value="ADD" />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('addNewServerInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>
        <?php
        $sql2 = "SELECT * FROM `servers` WHERE `inActive` = 0 ORDER BY `serverID`";
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows > 0){
          while($row2 = $result2->fetch_assoc()){
            $statuscolor = "red";
            if($row2["serverStatus"] == "active"){
              $statuscolor = "green";
            }
            echo "<div name='serverBlocks' class='w3-quarter w3-padding'>";
            echo "<div class='w3-light-grey w3-padding' style='height:200px;'>";
            if(!empty($row2["image"])){
              echo "<img class='w3-right blockImages' style='width:30%;max-height:110px;' src='http://iss.bfginternational.com/ISS/itemsImages/".$row2['image']."' />";
            }
            // echo "<i>Server #".$row2['serverID']."</i>";
            // echo "<a href='serverDetails.php?id=".$row2['serverID']."' class='w3-btn w3-border w3-small w3-right' style='padding:6px !important;margin-top: -5px;'>Details</a>";
            // echo "</div>";
            echo "<h4 style='text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".$row2["name"]."</h4>";
            echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["type"]) ? "-" : ucfirst($row2["type"]))."</p>";
            //echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["host"]) ? "-" : ucfirst($row2["host"]))."</p>";
            echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["hostIP"]) ? "-" : "HostIP: ".ucfirst($row2["hostIP"]))."</p>";
            echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["os"]) ? "-" : ucfirst($row2["os"]))."</p>";
            echo "<p style='margin:0;'><span class='w3-small w3-tag w3-".$statuscolor."'>".ucfirst($row2["serverStatus"])."</span>";
            echo "<div style='text-align:right;'><a href='serverDetails.php?server=".$row2['serverID']."' class='w3-text-grey' style='text-decoration:underline;'>Details</a></div>";
            echo "</div></div>";
          }
        }
      }
    }else{
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }
?>

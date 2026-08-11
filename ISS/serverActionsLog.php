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
      date_default_timezone_set('Asia/Bahrain');
      $row = $result->fetch_array(MYSQLI_ASSOC);
      $id = htmlspecialchars($_GET['server'], ENT_QUOTES);
      $input2 = mysqli_real_escape_string($mysqli, $id);
      $sql2 = "SELECT * FROM `servers` WHERE `serverID`=".$input2;
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<div class='w3-container w3-padding'>";
      echo "<div class='w3-padding w3-margin-top'>";
      echo "<a class='w3-small w3-btn w3-border' href='serverDetails.php?server=".$_GET["server"]."'>BACK</a>";
      echo "</div><div style='padding-bottom:50px;'>";
      echo "<h1 class='w3-padding title'>Server Actions Log</h1>";
      echo "<div class='w3-padding'><a class='w3-btn w3-border w3-small' onclick='showAddActionModal()'>Add Action</a>";
      echo "</div>";
      echo "<div class='w3-padding'><table class='w3-table-all'><tr class='w3-theme'><td style='width:130px;'><b>Date</b></td><td style='width:110px;'><b>Period</b></td><td style='width:110px;'><b>Action Type</b></td><td style='width:150px;'><b>User</b></td><td style='width:200px;'><b>Description</b></td>
      <td style='width:120px;'><b>Image</b></td></tr>";
      ?>

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
        .empImages{
          border-radius:25px;
          width:50px;
          height:50px;
          background-color:#eee;
        }
      </style>

      <script>
        function showAddActionModal(){
          document.getElementById('addActions').style.display='block';
        }
        window.onload = function(){
          for (let i=0;i<document.getElementsByClassName("empImages").length;i++){
            //console.log("http://iss.bfginternational.com/ISS/itemsImages/"+document.getElementsByClassName("empImages")[i].getAttribute("data-Bg"));
            document.getElementsByClassName("empImages")[i].style.background = "url(http://iss.bfginternational.com/ISS/itemsImages/"+document.getElementsByClassName("empImages")[i].getAttribute("data-Bg")+")";
            document.getElementsByClassName("empImages")[i].style.backgroundSize = "cover";
            document.getElementsByClassName("empImages")[i].style.backgroundPosition = "center";
          }
        }
      </script>

      <?php

      if($result2->num_rows > 0){
        $row2 = $result2->fetch_array(MYSQLI_ASSOC);

        ?>

        <div id="addActions" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
              <div class="w3-container w3-margin">
                <h2 class="title w3-margin-bottom">Log An Action</h2><br>
                <div class="w3-row">
                  <form action="addActions.php" method="post" enctype="multipart/form-data">
                    <input type="hidden" name="serverID" value="<?php echo $row2['serverID']; ?>">
                    <input type="hidden" name="user" value="<?php echo $row["id"]; ?>">
                  <div class="w3-half w3-padding">
                    <p>
                      <label>User</label>
                      <select class="w3-select w3-border w3-padding w3-white" name="userAction" required>
                        <option value="179">Salman Almosawi</option>
                        <option value="5400">Husain Rustam</option>
                        <option value="5152">Hadi Almahari</option>
                      </select>
                    </p>
                    <p>
                      <label>Action Type</label>
                      <select name="actionType" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                        <option value="Cleaned">Cleaned</option>
                        <option value="Decreased">Decreased</option>
                        <option value="Deleted">Deleted</option>
                        <option value="Disabled">Disabled</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Increased">Increased</option>
                        <option value="Installed">Installed</option>
                        <option value="Restart">Restart</option>
                        <option value="Updated">Updated</option>
                        <option value="Upgrade">Upgrade</option>
                        <option value="Uninstalled">Uninstalled</option>
                      </select>
                    </p>
                    <p>
                      <label>Date & Time</label>
                        <input class="w3-input w3-border" type="datetime-local" name="actionDate" required>
                    </p>
                    <p>
                      <label>Completion Period</label>
                      <input class="w3-input w3-border" type="text" maxlength="50" name="actionPeriod" required>
                    </p>
                  </div>
                  <div class="w3-half w3-padding">
                    <p>
                      <label>Description</label>
                      <textarea name="actionDescription" class="w3-input w3-border" type="text" placeholder="Describe the action..." maxlength="200" style="resize:none;"></textarea>
                    </p>
                    <p>
                      <label>Image</label>
                      <input name="actionImage" class="w3-input w3-border" type="file" accept="image/*">
                    </p>
                  </div>
                    <p>
                      <input class="w3-btn w3-margin-left" type="submit" value="Send">
                    </p>
                  </form>
                </div>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('addActions').style.display='none'">Close</div>
            </div>
          </div>
        </div>

        <?php

        $sql3 = "SELECT * FROM `serverActions` WHERE `serverID`=".$input2." ORDER BY actionDate DESC";
        if(!$result3 = $mysqli->query($sql3)){
          $mysqli->close();
          die("queryFailed");
        }

        while($row3 = $result3->fetch_assoc()){
          $sql4 = "SELECT * FROM `employees` WHERE employees.empID = ".$row3['user'];
          if(!$result4 = $mysqli->query($sql4)){
            $mysqli->close();
            die("queryFailed");
          }
          $row4 = $result4->fetch_array(MYSQLI_ASSOC);
          echo "<tr>
          <td>".date('d-m-Y h:i a', strtotime($row3['actionDate']))."</td>
          <td>".ucfirst($row3['actionPeriod'])."</td>
          <td><b>".ucfirst($row3['actionType'])."<b></td>";
          ?>
          <td style="width: 260px;">
            <div style="display:inline-block;vertical-align: middle;" class="empImages" data-Bg="<?php echo $row4['image']; ?>"></div>
            <span style="margin-top:-16px;">
              <?php echo $row4['empID']." "; ?>
              <?php echo $row4['name']; ?>
            </span>
           </td>
          <?php
          echo "<td>".ucfirst($row3['actionDescription'])."</td>";
          if(!empty($row3['actionImage'])){
            echo "<td><a target='_blank' href='http://iss.bfginternational.com/ISS/itemsImages/".$row3['actionImage']."'><img style='width:50px;' src='http://iss.bfginternational.com/ISS/itemsImages/".$row3['actionImage']."' /></a></td>";
          }else{
            echo "<td></td>";
          }
        }
        echo "</table></div>";
        echo "</div></div>";

      }else{
        echo "<table></div> No Result";
      }
    }else{
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }
  }
}else{
  die("<meta http-equiv='refresh' content='0;url=index.php' />");
}
?>

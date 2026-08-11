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
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      $assetTypesList = array();
      ?>
      <script>
        function changeRadio(selectedRadio){
          document.getElementById('inUseRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('inUseRadio').classList.remove("w3-sand");
          document.getElementById('availableRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('availableRadio').classList.remove("w3-sand");
          document.getElementById('defectiveRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('defectiveRadio').classList.remove("w3-sand");
          document.getElementById(selectedRadio+"Radio").style.border = "1px solid #ccc";
          document.getElementById(selectedRadio+"Radio").classList.add("w3-sand");
          if (selectedRadio == "inUse") {
            document.getElementsByClassName("radioStatus")[0].checked = true;
          }else if(selectedRadio == "available"){
            document.getElementsByClassName("radioStatus")[1].checked = true;
          }else if(selectedRadio == "defective"){
            document.getElementsByClassName("radioStatus")[2].checked = true;
          }
        }
        function selectAssetType(selectedCheck){
          if(document.getElementsByName(selectedCheck)[0].checked == true){
            document.getElementsByName(selectedCheck)[0].checked = false;
          }else{
            document.getElementsByName(selectedCheck)[0].checked = true;
          }
        }
      </script>
      <style>
        .assetTypesItems{
          border-bottom:2px solid #ffffff;
          transition: all 0.5s;
        }
        .assetTypesItems:hover{
          border-bottom:2px solid #0060df;
        }
      </style>
      <div class="w3-container">
        <h1 class="w3-padding title">Assets Report</h1>
        <div class="w3-margin-top w3-card-2 w3-padding">
          <form action="assetsReport.php" method="post">
            <h4>Asset Type</h4>
            <?php
              $sql2 = "SELECT DISTINCT type FROM `assets`";
              if(!$result2 = $mysqli->query($sql2)){
                $mysqli->close();
                die("queryFailed");
              }
              if ($result2->num_rows > 0){
                echo "<div style='max-width:700px;' class='w3-small'>";
                while($row2 = $result2->fetch_assoc()){
                  ?>
                  <p onclick="selectAssetType('<?php echo str_replace(" " , "_", $row2["type"]); ?>')" style="display:inline-block;cursor:pointer;">
                    <?php if($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST[str_replace(" " , "_", $row2["type"])] == "on"){ ?>
                      <input class="w3-check" type="checkbox" name="<?php echo str_replace(" " , "_", $row2["type"]); ?>" checked>
                    <?php }else{ ?>
                      <input class="w3-check" type="checkbox" name="<?php echo str_replace(" " , "_", $row2["type"]); ?>">
                    <?php } ?>
                    <span class="assetTypesItems w3-margin-right" style="user-select:none;"><?php echo $row2['type']; ?></span>
                  </p>
                  <?php
                  $assetTypesList[] = $row2['type'];
                }
                echo "</div>";
              }
            ?>
            <h4>Asset Status</h4>
            <input onclick="changeRadio('inUse')" class="w3-radio radioStatus" type="radio" name="assetStatus" value="inUse" checked>
            <span onclick="changeRadio('inUse')" id='inUseRadio' class="w3-padding-small w3-sand w3-small" style="border:1px solid #ccc;cursor:pointer;user-select:none;">In use</span>
            <input onclick="changeRadio('available')" class="w3-radio radioStatus" type="radio" name="assetStatus" value="available">
            <span onclick="changeRadio('available')" id='availableRadio' class="w3-padding-small w3-small" style="border:1px solid #fff;cursor:pointer;user-select:none;">Available</span>
            <input onclick="changeRadio('defective')" class="w3-radio radioStatus" type="radio" name="assetStatus" value="defective">
            <span onclick="changeRadio('defective')" id='defectiveRadio' class="w3-padding-small w3-small" style="border:1px solid #fff;cursor:pointer;user-select:none;">Defective</span>
            <?php
              if($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST["assetStatus"] == "available"){
                echo "<script>changeRadio('available');</script>";
              }elseif($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST["assetStatus"] == "defective"){
                echo "<script>changeRadio('defective');</script>";
              }
            ?>
            <br>
            <input class="w3-btn w3-margin-top w3-small w3-border" style="width:120px;" type="submit" value="Search">
            <br>
            <br>
          </form>
        </div>
      </div>
      <?php
      if($_SERVER['REQUEST_METHOD'] === 'POST'){
        $assetSelectedTypes = "";
        for ($i=0;$i<count($assetTypesList);$i++){
          if($_POST[str_replace(" " , "_", $assetTypesList[$i])] == "on"){
            $assetSelectedTypes = $assetSelectedTypes . "'".$assetTypesList[$i]."',";
          }
        }
        if(empty($assetSelectedTypes)){
          for ($i=0;$i<count($assetTypesList);$i++){
            $assetSelectedTypes = $assetSelectedTypes . "'".$assetTypesList[$i]."',";
          }
        }
        if($_POST['assetStatus'] == "inUse"){
          $assetStatus = "In Use";
        }elseif($_POST['assetStatus'] == "available"){
          $assetStatus = "Available";
        }else{
          $assetStatus = "Defective";
        }
        $input2 = mysqli_real_escape_string($mysqli, $assetStatus);
        $sql3 = "SELECT assets.id,assets.code,assets.deviceName,assets.type,assets.location,assets.department,assets.image,employees.name as owner,assets.deviceStatus
                 FROM assets
                 LEFT JOIN employees
                 ON assets.empID = employees.empID
                 WHERE assets.deviceStatus = '".$input2."' AND assets.type IN (".rtrim($assetSelectedTypes,',').")";
        if(!$result3 = $mysqli->query($sql3)){
          $mysqli->close();
          die("queryFailed");
        }
        echo "<div class='w3-container w3-margin-top' style='padding-bottom:40px;'><div class='w3-card-2 w3-padding'>";
        if ($result3->num_rows > 0){
          echo "<table class='w3-table w3-table-all' style='color:#303030;'>";
          echo "<tr style='background:#128cae;color:#fff;'><td><b>Code</b></td><td><b>Type</b></td><td><b>Image</b></td><td><b>Status</b></td><td><b>Location</b></td>
          <td><b>Department</b></td><td><b>Owner</b></td><td><b>Device Name</b></td><td></td></tr>";
          while($row3 = $result3->fetch_assoc()){
            echo "<tr><td>".$row3['code']."</td><td>".$row3['type']."</td>";
            if(!empty($row3['image'])){
              echo "<td><img style='width:100%;width:75px;' src='http://iss.bfginternational.com/ISS/itemsImages/".$row3['image']."' /></td>";
            }else{
              echo "<td></td>";
            }
            if($row3['deviceStatus'] == "In Use"){
              echo "<td><span class='w3-tag w3-red'>".$row3['deviceStatus']."</span></td>";
            }elseif($row3['deviceStatus'] == "Available"){
              echo "<td><span class='w3-tag w3-green'>".$row3['deviceStatus']."</span></td>";
            }elseif($row3['deviceStatus'] == "Defective"){
              echo "<td><span class='w3-tag w3-brown'>".$row3['deviceStatus']."</span></td>";
            }
            echo "<td>".$row3['location']."</td><td>".$row3['department']."</td>
            <td>".$row3['owner']."</td><td>".$row3['deviceName']."</td>
            <td><a class='w3-btn w3-small w3-border w3-white' target='_blank' href='assetDetails.php?code=".$row3["code"]."'>Details</a></td></tr>";
          }
          echo "</table>";
        }else{
          echo "<h4>No Result</h4>";
        }
        echo "</div></div>";
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

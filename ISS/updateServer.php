<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["serverID"]) && !empty($_POST["serverID"])){
      date_default_timezone_set('Asia/Bahrain');
      $serverName = htmlspecialchars($_POST['ServerName'], ENT_QUOTES);
      $serverType = htmlspecialchars($_POST['ServerType'], ENT_QUOTES);
      $serverStatus = htmlspecialchars($_POST['ServerStatus'], ENT_QUOTES);
      $serverOS = htmlspecialchars($_POST['ServerOS'], ENT_QUOTES);
      $serverIP = htmlspecialchars($_POST['ServerIP'], ENT_QUOTES);
      $serverHost = htmlspecialchars($_POST['host'], ENT_QUOTES);
      $serverHostIP = htmlspecialchars($_POST['HostIP'], ENT_QUOTES);
      $lastMainten = htmlspecialchars($_POST['LastMainten'], ENT_QUOTES);
      if(empty($lastMainten)){
        $lastMainten = "00-00-0000";
      }
      if($_POST['NextPeriod'] == "30days"){
        $nextMainten = date('Y-m-d',strtotime($lastMainten." +30 days"));
      }elseif ($_POST['NextPeriod'] == "60days") {
        $nextMainten = date('Y-m-d',strtotime($lastMainten." +60 days"));
      }else{
        $nextMainten = date('Y-m-d',strtotime($lastMainten." +90 days"));
      }
      $serverCPU = htmlspecialchars($_POST['Cpu'], ENT_QUOTES);
      $serverRAM = htmlspecialchars($_POST['Ram'], ENT_QUOTES);
      $diskSize = htmlspecialchars($_POST['DiskSize'], ENT_QUOTES);
      $diskAmount = htmlspecialchars($_POST['DiskAmount'], ENT_QUOTES);
      $diskSize2 = "";
      if (isset($_POST['DiskSize2'])){
        $diskSize2 = htmlspecialchars($_POST['DiskSize2'], ENT_QUOTES);
      }
      $diskType = htmlspecialchars($_POST['DiskType'], ENT_QUOTES);
      $diskType2 = "";
      if (isset($_POST['DiskType2'])){
      $diskType2 = htmlspecialchars($_POST['DiskType2'], ENT_QUOTES);
      }
      $location = htmlspecialchars($_POST['Location'], ENT_QUOTES);
      $location2 = "";
      if (isset($_POST['Location2'])){
      $location2 = htmlspecialchars($_POST['Location2'], ENT_QUOTES);
      }
      $backupStatus = htmlspecialchars($_POST['BackupStatus'], ENT_QUOTES);
      $backupSoftware = htmlspecialchars($_POST['BackupSoftware'], ENT_QUOTES);
      $description = htmlspecialchars($_POST['Description'], ENT_QUOTES);
      $notes = htmlspecialchars($_POST['Notes'], ENT_QUOTES);
      $Applications = htmlspecialchars($_POST['Applications'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $serverID = htmlspecialchars($_POST['serverID'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $serverName);
      $input2 = mysqli_real_escape_string($mysqli, $serverType);
      $input3 = mysqli_real_escape_string($mysqli, $serverStatus);
      $input4 = mysqli_real_escape_string($mysqli, $serverOS);
      $input5 = mysqli_real_escape_string($mysqli, $serverIP);
      $input6 = mysqli_real_escape_string($mysqli, $serverHost);
      $input7 = mysqli_real_escape_string($mysqli, $serverHostIP);
      $input8 = mysqli_real_escape_string($mysqli, $lastMainten);
      $input9 = mysqli_real_escape_string($mysqli, $nextMainten);
      $input10 = mysqli_real_escape_string($mysqli, $serverCPU);
      $input11 = mysqli_real_escape_string($mysqli, $serverRAM);
      $input12 = mysqli_real_escape_string($mysqli, $diskSize);
      $input13 = mysqli_real_escape_string($mysqli, $diskType);
      $input14 = mysqli_real_escape_string($mysqli, $diskAmount);
      $input15 = mysqli_real_escape_string($mysqli, $location);
      $input16 = mysqli_real_escape_string($mysqli, $backupStatus);
      $input17 = mysqli_real_escape_string($mysqli, $backupSoftware);
      $input18 = mysqli_real_escape_string($mysqli, $description);
      $input19 = mysqli_real_escape_string($mysqli, $notes);
      $input20 = mysqli_real_escape_string($mysqli, $Applications);
      $input21 = mysqli_real_escape_string($mysqli, $user);
      $input22 = mysqli_real_escape_string($mysqli, $serverID);
      $input23 = mysqli_real_escape_string($mysqli, $diskSize2);
      $input24 = mysqli_real_escape_string($mysqli, $diskType2);
      $input25 = mysqli_real_escape_string($mysqli, $location2);

      $sql = "UPDATE `servers` SET `name`='".$input1."',`type`='".$input2."',`serverStatus`='".$input3."',`os`='".$input4."',`serverIP`='".$input5."',
      `host`='".$input6."',`hostIP`='".$input7."',`maintenanceLast`='".$input8."',`maintenanceDue`='".$input9."',`cpu`='".$input10."',`ram`='".$input11."',
       `disk`='".$input12."',`diskType`='".$input13."',`diskAmount`='".$input14."',`location`='".$input15."',`backupStatus`='".$input16."',
        `backupSoftware`='".$input17."',`descrip`='".$input18."',`notes`='".$input19."',`Applications`='".$input20."', `disk2`='".$input23."', `diskType2`='".$input24."', `location2`='".$input25."' WHERE `serverID`=".$input22;
        if(count($_FILES) > 0 && !empty($_FILES['serverImage']["name"])){
          if ($_FILES['serverImage']['error'] !== 0){
            die("failedUpload1");
          }
          $info = getimagesize($_FILES['serverImage']['tmp_name']);
          if ($info === FALSE){
            die("failedUpload2");
          }
          if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
            die("failedUpload3");
          }
          if (!move_uploaded_file($_FILES["serverImage"]["tmp_name"], "/var/www/html/ISS/itemsImages/servers".$serverID."_".$_FILES["serverImage"]["name"])){
            die("failedUpload4");
          }else{
            $imagePath = "/var/www/html/ISS/itemsImages/servers".$serverID."_".$_FILES["serverImage"]["name"];
            if($info[0] > 1000){
              $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }elseif($info[1] > 1000){
              $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }
            $sql = "UPDATE `servers` SET `name`='".$input1."',`type`='".$input2."',`serverStatus`='".$input3."',`os`='".$input4."',`serverIP`='".$input5."',
            `host`='".$input6."',`hostIP`='".$input7."',`maintenanceLast`='".$input8."',`maintenanceDue`='".$input9."',`cpu`='".$input10."',`ram`='".$input11."',
             `disk`='".$input12."',`diskType`='".$input13."',`diskAmount`='".$input14."',`location`='".$input15."',`backupStatus`='".$input16."',
              `backupSoftware`='".$input17."',`descrip`='".$input18."',`notes`='".$input19."',`Applications`='".$input20."', `disk2`='".$input23."', `diskType2`='".$input24."', `location2`='".$input25."',
              `image`='servers".$serverID."_".$_FILES["serverImage"]["name"]."' WHERE `serverID`=".$input22;
            }
          }
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input21.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','servers',".$input22.")";
        $mysqli->query($sqlLog);
        $mysqli->close();
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Updated Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=serverDetails.php?server='.$serverID.'" />');
      }else{
        $mysqli->close();
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=serverDetails.php?server='.$serverID.'" />');
      }
    }
  }
?>

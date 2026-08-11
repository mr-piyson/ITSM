<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    date_default_timezone_set('Asia/Bahrain');
    $serverName = htmlspecialchars($_POST['ServerName'], ENT_QUOTES);
    $serverType = htmlspecialchars($_POST['ServerType'], ENT_QUOTES);
    $serverStatus = htmlspecialchars($_POST['ServerStatus'], ENT_QUOTES);
    $serverOS = htmlspecialchars($_POST['ServerOS'], ENT_QUOTES);
    $serverIP = htmlspecialchars($_POST['ServerIP'], ENT_QUOTES);
    $serverHost = htmlspecialchars($_POST['host'], ENT_QUOTES);
    $serverHostIP = htmlspecialchars($_POST['HostIP'], ENT_QUOTES);
    $lastMainten = $_POST['LastMainten'];
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
    $diskType = htmlspecialchars($_POST['DiskType'], ENT_QUOTES);
    $diskAmount = htmlspecialchars($_POST['DiskAmount'], ENT_QUOTES);
    $location = htmlspecialchars($_POST['Location'], ENT_QUOTES);
    $backupStatus = htmlspecialchars($_POST['BackupStatus'], ENT_QUOTES);
    $backupSoftware = htmlspecialchars($_POST['BackupSoftware'], ENT_QUOTES);
    $description = htmlspecialchars($_POST['Description'], ENT_QUOTES);
    $notes = htmlspecialchars($_POST['Notes'], ENT_QUOTES);
    $Applications = htmlspecialchars($_POST['Applications'], ENT_QUOTES);
    $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
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
    $input20 = mysqli_real_escape_string($mysqli, $user);
    $input21 = mysqli_real_escape_string($mysqli, $Applications);
    $sql = "INSERT INTO `servers`(`name`, `type`, `os`, `serverIP`, `host`, `hostIP`, `maintenanceLast`, `maintenanceDue`, `cpu`, `ram`, `disk`, `diskType`,
         `diskAmount`, `location`, `backupStatus`, `backupSoftware`, `descrip`, `serverStatus`, `Applications`, `notes`, `inActive`)
              VALUES ('".$input1."','".$input2."','".$input4."','".$input5."','".$input6."','".$input7."',STR_TO_DATE('".$input8."', '%Y-%m-%d'),
              STR_TO_DATE('".$input9."', '%Y-%m-%d'),'".$input10."','".$input11."','".$input12."','".$input13."','".$input14."','".$input15."','".$input16."',
              '".$input17."','".$input18."','".$input3."','".$input21."','".$input19."',0)";
      if($mysqli->query($sql) === TRUE){
        $serverID = $mysqli->insert_id;
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`)
                   VALUES (".$input20.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','servers',".$serverID.")";
        $mysqli->query($sqlLog);
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
        $mysqli->close();
        die('<meta http-equiv="refresh" content="2;url=serversList.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        $mysqli->close();
        die('<meta http-equiv="refresh" content="2;url=serversList.php" />');
      }
  }
?>

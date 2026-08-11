<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["assetID"]) && !empty($_POST["assetID"]) && isset($_POST["newOwner"]) && !empty($_POST["newOwner"]) && isset($_POST["user"]) && !empty($_POST["user"])){
      date_default_timezone_set('Asia/Bahrain');
      $assetID = htmlspecialchars($_POST['assetID'], ENT_QUOTES);
      $newOwner = htmlspecialchars($_POST['newOwner'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $assetID);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $input3 = mysqli_real_escape_string($mysqli, $newOwner);

      $sql0 = "SELECT * FROM `assets` WHERE `id`=".$input1;
      if(!$result0 = $mysqli->query($sql0)){
        die("queryFailed");
      }
      $row0 = $result0->fetch_array(MYSQLI_ASSOC);

      $sql = "UPDATE `assets` SET `empID`=".$input3." WHERE `id`=".$input1;
      if($mysqli->query($sql) === TRUE){
        $sqlOwnerLog = "INSERT INTO `assestOwnerUpdateLogs`(`user`, `oldOwnerEmpID`, `oldOwnerText`, `newOwnerID`, `date`, `assetID`) VALUES (".$input2.",".$row0['empID'].",'".$row0['owner']."',".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),".$input1.")";
        $mysqli->query($sqlOwnerLog);
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','asset',".$input1.")";
        $mysqli->query($sqlLog);
        die("updated");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>

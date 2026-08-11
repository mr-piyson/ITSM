<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["empID"]) && !empty($_POST["empID"]) && isset($_POST["user"]) && !empty($_POST["user"])){
      date_default_timezone_set('Asia/Bahrain');
      $empID = htmlspecialchars($_POST['empID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $empID);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $sql = "UPDATE `employees` SET `inActive`=1 WHERE `empID`=".$input1;
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'deactivate','employee',".$input1.")";
        $mysqli->query($sqlLog);
        die("deleted");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>

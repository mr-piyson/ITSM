<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["name"]) && !empty($_POST["name"]) && isset($_POST["empID"]) && !empty($_POST["empID"])){
      date_default_timezone_set('Asia/Bahrain');
      $empName = htmlspecialchars($_POST['name'], ENT_QUOTES);
      $empID = htmlspecialchars($_POST['empID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $empName);
      $input2 = mysqli_real_escape_string($mysqli, $empID);
      $input3 = mysqli_real_escape_string($mysqli, $user);
      $sql0 = "SELECT * FROM `employees` WHERE `name`='".$input1."' OR `empID`=".$input2;
      if(!$result0 = $mysqli->query($sql0)){
        die("queryFailed");
      }
      if ($result0->num_rows > 0){
        die("alreadyAdded");
      }
      $sql = "INSERT INTO `employees`(`empID`, `name`, `user`, `inActive`) VALUES (".$input2.",'".$input1."',".$input3.",0)";
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','employee',".$mysqli->insert_id.")";
        $mysqli->query($sqlLog);
        die("added");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>

<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(
      isset($_POST["startDate"])
      && !empty($_POST["startDate"])
      && isset($_POST["endDate"])
      && !empty($_POST["endDate"])
      && isset($_POST["cost"])
    ){
      date_default_timezone_set('Asia/Bahrain');
      $startDate = htmlspecialchars($_POST['startDate'], ENT_QUOTES);
      $endDate = htmlspecialchars($_POST['endDate'], ENT_QUOTES);
      $cost = htmlspecialchars($_POST['cost'], ENT_QUOTES);
      $currency = htmlspecialchars($_POST['currency'], ENT_QUOTES);
      $bilingCycle = htmlspecialchars($_POST['bilingCycle'], ENT_QUOTES);
      $account = htmlspecialchars($_POST['account'], ENT_QUOTES);
      $notes = htmlspecialchars($_POST['notes'], ENT_QUOTES);
      $support = htmlspecialchars($_POST['support'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $contractID = htmlspecialchars($_POST['contractID'], ENT_QUOTES);
      $docslink = htmlspecialchars($_POST['docslink'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $contractID);
      $input3 = mysqli_real_escape_string($mysqli, $user);
      $input4 = mysqli_real_escape_string($mysqli, $startDate);
      $input5 = mysqli_real_escape_string($mysqli, $endDate);
      $input6 = mysqli_real_escape_string($mysqli, $cost);
      $input7 = mysqli_real_escape_string($mysqli, $currency);
      $input8 = mysqli_real_escape_string($mysqli, $bilingCycle);
      $input9 = mysqli_real_escape_string($mysqli, $account);
      $input10 = mysqli_real_escape_string($mysqli, $notes);
      $input11 = mysqli_real_escape_string($mysqli, $support);
      $input12 = mysqli_real_escape_string($mysqli, $docslink);
      $sql = "UPDATE `contracts` SET `startDate`='".$input4."',`endDate`='".$input5."',`notes`='".$input10."',`support`='".$input11."',
      `account`='".$input9."',`cost`='".$input6."',`currency`='".$input7."',`bilingCycle`='".$input8."',`docslink`='".$input12."' WHERE `id`=".$input1;
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','contract',".$input1.")";
        $mysqli->query($sqlLog);
        die("updated");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>

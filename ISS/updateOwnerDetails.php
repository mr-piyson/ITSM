<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
  if(isset($_POST["empID"]) && !empty($_POST["empID"]) && isset($_POST["user"]) && !empty($_POST["user"])){
    date_default_timezone_set('Asia/Bahrain');
    $empID = htmlspecialchars($_POST['empID'], ENT_QUOTES);
    $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
    $license = htmlspecialchars($_POST['license'], ENT_QUOTES);
    $msProject = htmlspecialchars($_POST['msProject'], ENT_QUOTES);
    $powerPi = htmlspecialchars($_POST['powerPi'], ENT_QUOTES);
    $authenticationTwoFactor = htmlspecialchars($_POST['authenticationTwoFactor'], ENT_QUOTES);
    $authenticationAuthenticator = htmlspecialchars($_POST['authenticationAuthenticator'], ENT_QUOTES);
    $authenticationPhone = htmlspecialchars($_POST['authenticationPhone'], ENT_QUOTES);
    for ($i=0; $i <count($_POST['groupName']) ; $i++) {
      $_POST['groupName'][$i] = htmlspecialchars($_POST['groupName'][$i], ENT_QUOTES);
    }
    $recipientLimit = htmlspecialchars($_POST['recipientLimit'], ENT_QUOTES);
    $oneDrive = htmlspecialchars($_POST['oneDrive'], ENT_QUOTES);
    $mailType = htmlspecialchars($_POST['mailType'], ENT_QUOTES);
    $mailStorageSize = htmlspecialchars($_POST['mailStorageSize'], ENT_QUOTES);
    $onlineMailboxArchive = htmlspecialchars($_POST['onlineMailboxArchive'], ENT_QUOTES);
    $onlineArchiveStorageSize = htmlspecialchars($_POST['onlineArchiveStorageSize'], ENT_QUOTES);
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $input1 = mysqli_real_escape_string($mysqli, $empID);
    $input2 = mysqli_real_escape_string($mysqli, $user);
    $input3 = mysqli_real_escape_string($mysqli, $license);
    $input4 = mysqli_real_escape_string($mysqli, $msProject);
    $input5 = mysqli_real_escape_string($mysqli, $powerPi);
    $input6 = mysqli_real_escape_string($mysqli, $authenticationTwoFactor);
    $input7 = mysqli_real_escape_string($mysqli, $authenticationAuthenticator);
    $input8 = mysqli_real_escape_string($mysqli, $authenticationPhone);
    $input10 = mysqli_real_escape_string($mysqli, $recipientLimit);
    $input11 = mysqli_real_escape_string($mysqli, $oneDrive);
    $input12 = mysqli_real_escape_string($mysqli, $mailType);
    $input13 = mysqli_real_escape_string($mysqli, $mailStorageSize);
    $input14 = mysqli_real_escape_string($mysqli, $onlineMailboxArchive);
    $input15 = mysqli_real_escape_string($mysqli, $onlineArchiveStorageSize);

    $sql2 = "SELECT * FROM `employeesDetails` WHERE `empID` = ".$input1;
    if($result2 = $mysqli->query($sql2)){
      if($result2->num_rows > 0){
        $sql3 = "UPDATE `employeesDetails` SET `license`='$input3',`msProject`=$input4,`powerPi`=$input5,`authenticationTwoFactor`=$input6,
        `authenticationAuthenticator`=$input7,`authenticationPhone`=$input8,`recipientLimit`='$input10',`oneDrive`=$input11,`mailType`='$input12',
        `mailStorageSize`='$input13',`onlineMailboxArchive`=$input14,`onlineArchiveStorageSize`='$input15' WHERE `empID`='$input1'";
      }else{
        $sql3 = "INSERT INTO `employeesDetails`(`empID`, `license`, `msProject`, `powerPi`, `authenticationTwoFactor`, `authenticationAuthenticator`,
          `authenticationPhone`, `recipientLimit`, `oneDrive`, `mailType`, `mailStorageSize`, `onlineMailboxArchive`, `onlineArchiveStorageSize`)
          VALUES ('$input1', '$input3', $input4, $input5, $input6, $input7, $input8, '$input10', $input11, '$input12', '$input13', $input14,'$input15')";
        }
        if($mysqli->query($sql3) === TRUE){

          $sql5 = "DELETE FROM `employeesGroupDetails` WHERE `empID` = ".$input1;
          if($mysqli->query($sql5) === FALSE){
            die("queryFailed");
          }
          for ($i=0; $i <count($_POST['groupName']) ; $i++) {
            $input9 = mysqli_real_escape_string($mysqli, $_POST['groupName'][$i]);
            $sql6 = "INSERT INTO `employeesGroupDetails`(`empID`, `groupName`) VALUES ($input1,'".$input9."')";
            if($mysqli->query($sql6) === FALSE){
              die("queryFailed");
            }
          }

          echo "added";

        }else{
          die("queryFailed");
        }
    }
  }
}
?>

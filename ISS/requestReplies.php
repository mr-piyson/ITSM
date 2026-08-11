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
    if(isset($_GET["request"]) && !empty($_GET["request"])){
      $row = $result->fetch_array(MYSQLI_ASSOC);
      $id = htmlspecialchars($_GET['request'], ENT_QUOTES);;
      $input2 = mysqli_real_escape_string($mysqli, $id);
      $sql2 = "SELECT * FROM `requests` WHERE `id`=".$input2;
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      $sql3 = "SELECT requestReplies.*,users.name From requestReplies
               left JOIN users
               on users.id = requestReplies.userID
               WHERE requestReplies.requestID = ".$input2."
               ORDER BY requestReplies.replyDate DESC";
       if(!$result3 = $mysqli->query($sql3)){
         $mysqli->close();
         die("queryFailed");
       }
      if($result2->num_rows > 0){
        $row2 = $result2->fetch_array(MYSQLI_ASSOC);
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<div class='w3-container w3-padding'>";
        echo "<div class='w3-padding w3-margin-top'>";
        echo "<a class='w3-small w3-btn w3-border' href='requestsList.php'>BACK</a>";
        echo "</div>";
        echo "<h1 class='w3-padding title'>Request Details</h1>";
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
          </style>

          <div id="reqDetails" class ="w3-row w3-margin-top">
            <div class="w3-padding w3-half w3-card" style="width:49%; margin-right:12px;">
              <div class="w3-row">
                <div class="w3-padding w3-third">
                  <label><b>Date Submitted</b></label><br>
                    <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo date('d-m-Y h:i a', strtotime($row2['submitDate'])); ?> </p>
                    </div>
                <div class="w3-padding w3-third">
                  <label><b>Request ID</b></label><br>
                  <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo $row2['id']; ?> </p>
                </div>
                <div class="w3-padding w3-third">
                  <label><b>Priority Level</b></label><br>
                  <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo ucfirst($row2['requestPrio']); ?> </p>
                </div>
                <div class="w3-padding w3-third">
                  <label><b>Status</b></label><br>
                    <p style="background-color:whitesmoke;padding-left:5px;" id="Status"> <?php echo ucfirst($row2['status']); ?> </p>
                </div>
                <div class="w3-padding w3-margin-top w3-third">
                  <label><b>Page Type</b></label><br>
                    <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo ucfirst($row2['pgtype']); ?> </p>
                </div>
                <div class="w3-padding w3-margin-top w3-third">
                  <label><b>Page Name</b></label><br>
                    <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo ucfirst($row2['slctname'])." ".ucfirst($row2['newpg']); ?></p>
                      <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo ucfirst($row2['otherpg']); ?> </p>
                </div>
                <div class="w3-padding w3-margin-top w3-third">
                  <label><b>Modifications</b></label><br>
                    <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo ucfirst($row2['modifi']); ?> </p>
                </div>
              </div>
              <div class="w3-padding w3-marign-top">
                <label><b>Description</b></label><br>
                  <p style="background-color:whitesmoke;padding-left:5px;"> <?php echo ucfirst($row2['descrip']); ?> </p>
              </div>
              <div class="w3=padding w3-margin-top w3-margin-left">
                <label><b>Attached Image</b></label><br>
                  <?php
                    if(!empty($row2['imagefilePath'])){
                      echo "<td><a target='_blank' href='itemsImages/".$row2['imagefilePath']."'><img style='width:350px;' src='itemsImages/".$row2['imagefilePath']."' /></a></td>";
                    }
                  ?>
              </div>
            </div>
            <div  class="w3-padding w3-half w3-card">
              <form id="replyform" action="addRequestReply.php" method="post">
                <div class="w3-padding">
                <h5>Replies</h5>
                <?php
                if($result3->num_rows > 0){
                  while($row3 = $result3->fetch_assoc()){
                    echo "<div class='w3-border w3-padding w3-margin-top'>";
                    echo "<p><label style='text-align:left;'><b>".$row3['name'].": </b><span style='float:right;'>".date('d-m-Y h:i a', strtotime($row3['replyDate']))."</label></p>";
                    echo "<p style='background-color:whitesmoke;padding-left:5px;'>" .$row3['reply']. "</p>";
                    echo "</span></div>";
                  }
                }
                ?>
                <input type="hidden" name="requestID" value="<?php echo $row2['id']?>">
                <input type="hidden" name="userID" value="<?php echo $row['id']; ?>">
                <textarea class="w3-input w3-border w3-margin-top" type="text" style="width:100%;" name="replybox" required></textarea>
                <input class="w3-btn w3-right w3-border w3-margin-top" type="submit" value="Reply">
                </div>
              </form>
            </div>
          </div>

        <?php
      }else{
        die("<meta http-equiv='refresh' content='0;url=index.php' />");
      }
    }else{
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }
}
}else{
  die("<meta http-equiv='refresh' content='0;url=index.php' />");
}
?>

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
      if(isset($_GET["id"]) && !empty($_GET["id"]) && is_numeric($_GET["id"])){
        $printerID = htmlspecialchars($_GET['id'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $printerID);
        $sql2 = "SELECT * FROM `printers` WHERE `id`=".$input2;
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows === 0){
          die("<meta http-equiv='refresh' content='0;url=index.php' />");
        }else{
          $row2 = $result2->fetch_array(MYSQLI_ASSOC);
          $actiontable = "";
          if(isset($_POST["fromDate"])){
            $from = htmlspecialchars($_POST['fromDate'], ENT_QUOTES);
            $to = htmlspecialchars($_POST['toDate'], ENT_QUOTES);
            $input3 = mysqli_real_escape_string($mysqli, $from);
            $input4 = mysqli_real_escape_string($mysqli, $to);
            $sql3 = " SELECT pa.id,pa.printerID,pa.actionType,pa.actionDate,pa.actionBy,pa.note,pa.itemID,pa.requestedBy,pa.recievedBy,i.name
                      FROM printerActions pa
                      LEFT JOIN items i
                      ON i.id = pa.itemID
                      WHERE pa.printerID =".$row2["id"]." AND pa.actionDate >= '".$input3."' AND pa.actionDate <= '".$input4."' ORDER BY pa.actionDate DESC";
          }else{
            $sql3 = " SELECT pa.id,pa.printerID,pa.actionType,pa.actionDate,pa.actionBy,pa.note,pa.itemID,pa.requestedBy,pa.recievedBy,i.name
                      FROM printerActions pa
                      LEFT JOIN items i
                      ON i.id = pa.itemID
                      WHERE pa.printerID =".$row2["id"]." ORDER BY pa.actionDate DESC";
          }
          if(!$result3 = $mysqli->query($sql3)){
            die("queryFailed");
          }
          if ($result3->num_rows === 0){
            $actiontable = "<table class='w3-table w3-table-all w3-card-2 w3-margin-top'><tr><td>No Actions<td></tr></table>";
          }else{
            $actiontable = "<table class='w3-table w3-table-all w3-card-2 w3-margin-top'>";
            $actiontable = $actiontable . "<tr style='background:#eefafd;'><td><b>Type</b></td><td><b>Date</b></td><td><b>Action By</b></td><td><b>Replaced Toner</b></td><td><b>Note</b></td></tr>";
            while($row3 = $result3->fetch_assoc()){
              $tagColor = "";
              $itemReplaced = "";
              if ($row3['actionType'] == "Replaced") {
                $tagColor = "w3-blue";
                $itemReplaced = $row3['name'];
              }elseif($row3['actionType'] == "Provided"){
                $tagColor = "w3-indigo";
                $itemReplaced = $row3['name'];
              }elseif($row3['actionType'] == "Checked"){
                $tagColor = "w3-yellow";
              }elseif($row3['actionType'] == "Serviced"){
                $tagColor = "w3-green";
              }elseif($row3['actionType'] == "Cleaned"){
                $tagColor = "w3-teal";
              }elseif($row3['actionType'] == "Recieved"){
                $tagColor = "w3-orange";
              }
              $actiontable = $actiontable . "<tr><td><span class='w3-padding-small ".$tagColor."'>".$row3['actionType']."</span></td><td>".$row3['actionDate']."</td><td>".$row3['actionBy']."</td><td>".$row3['name']."</td><td>".$row3['note']."</td></tr>";
            }
            $actiontable = $actiontable . "</table>";
          }
        }
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        ?>
        <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
          <div class="w3-padding">
            <a class="w3-small w3-btn w3-border" href="printerDetails.php?id=<?php echo $row2['id']; ?>">BACK</a>
          </div>
          <div class="w3-container">
            <h1 class="title">All Actions Logs</h1>
            <form action="allActionLogs.php?id=<?php echo $row2['id']; ?>" method="post">
              <div style="display:inline-block;">
                <label>From</label>
                <input class="w3-input w3-border" type="date" name="fromDate" style="max-width:200px;">
              </div>
              <div style="display:inline-block;">
                <label>To</label>
                <input class="w3-input w3-border" type="date" name="toDate" style="max-width:200px;">
              </div>
              <input style="height:40px;vertical-align:bottom;" class="w3-btn w3-border w3-small" type="submit" value="Search">
            </form>
            <div class="w3-container w3-padding">
              <?php echo $actiontable; ?>
            </div>
          </div>
        </div>
        <?php
      }else{
        die("<meta http-equiv='refresh' content='0;url=index.php' />");
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

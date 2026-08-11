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
      $row = $result->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<div class='w3-container w3-padding'>";
      echo "<div class='w3-padding w3-margin-top'>";
      echo "<a class='w3-small w3-btn w3-border' href='home.php'>BACK</a>";
      echo "</div>";
      echo "<h1 class='w3-padding title'>Requests List</h1>";
      if(!isset($_GET["filter"])){
        $sql2 = "SELECT r.*,u.name from requests r
                 LEFT JOIN users u
                 ON r.user = u.id
                 ORDER BY r.submitDate DESC";
      }else{
        $filter = htmlspecialchars($_GET['filter'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $filter);
        $sql2 = "SELECT r.*,u.name from requests r
                 LEFT JOIN users u
                 ON r.user = u.id
                 WHERE r.status = '".$input2."'
                 ORDER BY r.submitDate DESC";
      }
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows > 0){
        ?>
        <div class="w3-row w3-padding w3-right">
          <label>Filter By</label>
          <select id="Filter" class="w3-select w3-padding w3-white w3-border w3-right" name="filter" onchange="filterBy()">
            <option value="All">All</option>
            <option value="completed">Completed</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <?php
        $counter = 0;
        echo "<div class='w3-padding'><table class='w3-table-all'><tr class='w3-theme'><td><b>Submit Date</b></td><td><b>Request ID</b></td><td><b>Priority Level</b></td><td><b>User</b></td><td><b>Page Type</b></td>
        <td><b>Page Name</b></td><td><b>Modification</b></td><td><b>Description</b></td><td><b>Image</b></td><td><b>Status</b></td><td></td></tr>";
        while($row2 = $result2->fetch_assoc()){
          if($row2['requestPrio'] == "high"){
            $prioColor = 'red';
          }
          if($row2['requestPrio'] == "medium"){
            $prioColor = 'yellow';
          }
          if($row2['requestPrio'] == "low"){
            $prioColor = 'cyan';
          }
          if($row2['user'] == $row['id'] || $row['id'] == 1 || $row['id'] == 7){
            echo "<tr><td>".date('d-m-Y h:i a',strtotime($row2['submitDate']))."</td><td>".$row2['id']."</td><td><span class='w3-tag w3-".$prioColor."'><b>".ucfirst($row2['requestPrio'])."<b></span></td><td>".ucfirst($row2['name'])."</td><td>".ucfirst($row2['pgtype'])."</td>";
            if($row2['slctname'] == "other"){
              echo "<td>".ucfirst($row2['slctname'])." (".ucfirst($row2['otherpg']).")</td>";
            }else{
              if($row2['pgtype'] == "exisiting"){
                echo "<td>".ucfirst($row2['slctname'])."</td>";
              }else{
                echo "<td>".ucfirst($row2['newpg'])."</td>";
              }
            }
            echo "<td>".ucfirst($row2['modifi'])."</td>";
            ?>
            <td class='truncate' onclick="RevealHiddenOverflow(<?php echo $counter; ?>)" style='cursor: pointer;max-width:200px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;'><?php echo $row2['descrip']; ?></td>
            <?php
            $counter = $counter + 1;
            if(!empty($row2['imagefilePath'])){
              echo "<td><a target='_blank' href='itemsImages/".$row2['imagefilePath']."'><img style='width:50px;' src='itemsImages/".$row2['imagefilePath']."' /></a></td>";
            }else{
              echo "<td></td>";
            }
            if($row2['status'] == "pending"){
              $statusColor = 'orange';
            }
            if($row2['status'] == "accepted"){
              $statusColor = 'indigo';
            }
            if($row2['status'] == "declined"){
              $statusColor = 'red';
            }
            if($row2['status'] == "completed"){
              $statusColor = 'green';
            }
            echo "<td class='w3-text-".$statusColor."'><b>".ucfirst($row2['status'])."<b></td><td><a style='width:120px;' onclick=showUpdateStatusModal(".$row2['id'].",'".$row2['status']."') class='w3-btn w3-border w3-white w3-small'>Update Status</a><br>
            <a style='margin-top:5px;width:120px;' href='requestReplies.php?request=".$row2['id']."' class='w3-btn w3-border w3-white w3-small'>Reply</a></td></tr>";
          }
        }
        echo "</table></div>";
      }else{
        ?>
        <div class="w3-row w3-padding w3-right">
          <label>Filter By</label>
          <select id="Filter" class="w3-select w3-padding w3-white w3-border w3-right" name="filter" onchange="filterBy()">
            <option value="All">All</option>
            <option value="completed">Completed</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <?php
        echo "<h4 class='w3-text-grey'>No Result</h4>";
      }
      if(isset($_GET["filter"])){
        echo "<script>document.getElementById('Filter').value = '".$_GET['filter']."';</script>";
      }
      ?>
      <script>
        function RevealHiddenOverflow(x){
          if(document.getElementsByClassName("truncate")[x].style.whiteSpace == 'nowrap'){
            document.getElementsByClassName("truncate")[x].style.whiteSpace = 'normal';
          }else{
            document.getElementsByClassName("truncate")[x].style.whiteSpace = 'nowrap';
          }
        }
        var StatusSelect = "";
        function showUpdateStatusModal(x,y){
          StatusSelect = y;
          document.getElementsByName('requestID')[0].value = x;
          document.getElementById("updateStatusModal").style.display = "block";
          document.getElementById('statusSelect').value = y;
        }
        function statusButton(){
          if (document.getElementById("statusSelect").value == StatusSelect){
            document.getElementById("UpdateSubmit").disabled = true;
          }else{
            document.getElementById("UpdateSubmit").disabled = false;
          }
        }
        function showDetails(){
          document.getElementById("Details").style.display = "inline";
        }
        function filterBy(){
          if(document.getElementById("Filter").value == "All"){
            window.location.href = "http://iss.bfginternational.com/ISS/requestsList.php";
          }else{
            window.location.href = "http://iss.bfginternational.com/ISS/requestsList.php?filter="+document.getElementById("Filter").value;
          }
        }
      </script>
        <div id="updateStatusModal" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
          <div class="w3-containter" style="height:350px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <h2 class="title">Update Request Status</h2>
              <form action="updateStatus.php" method="post">
                <div class="w3-padding">
                  <label><b>Status</b></label>
                  <select name="newStatus" id= "statusSelect" class="w3-select w3-padding w3-white w3-border" style="margin-top:5px;margin-bottom:5px;" onchange="statusButton()">
                    <option value="completed">Completed</option>
                    <option value="accepted">Accepted</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                  <input type="hidden" name="requestID">
                  <input type="hidden" name="userID" value="<?php echo $row['id']; ?>">
                  <div class="w3-white w3-border w3-btn w3-margin-top" onclick="document.getElementById('updateStatusModal').style.display='none'">Close</div>
                  <input id="UpdateSubmit" class="w3-right w3-brown w3-btn w3-border w3-margin-top" type="submit" value="Update" disabled>
                </div>
              </form>
            </div>
          </div>
          </div>
        </div>
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

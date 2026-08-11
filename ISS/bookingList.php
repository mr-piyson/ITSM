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
      echo "<a class='w3-small w3-btn w3-border' href='booking.php'>BACK</a>";
      echo "</div>";
      echo "<h1 class='w3-padding title'>Asset Booking List</h1>";
      if(isset($_GET["onlyBooked"])){
        echo "<div class='w3-padding'><a style='width:150px;' class='w3-border w3-btn w3-small' href='bookingList.php'>Show All</a></div>";
      }else{
        echo "<div class='w3-padding'><a style='width:150px;' class='w3-border w3-btn w3-small' href='bookingList.php?onlyBooked'>Only Booked</a></div>";
      }
      $sql2 = "SELECT assetBooking.*,assets.deviceName,assets.type,assets.code,assets.location,
               assets.manufacturer,assets.model,employees.name as employeeName,employees.image as employeeImage FROM assetBooking
               LEFT JOIN assets
               ON assetBooking.assetID = assets.id
               LEFT JOIN employees
               ON employees.empID = assetBooking.empID
               ORDER BY assetBooking.bookingDate DESC";
      if(isset($_GET["onlyBooked"])){
        $sql2 = "SELECT assetBooking.*,assets.deviceName,assets.type,assets.code,assets.location,
                 assets.manufacturer,assets.model,employees.name as employeeName,employees.image as employeeImage FROM assetBooking
                 LEFT JOIN assets
                 ON assetBooking.assetID = assets.id
                 LEFT JOIN employees
                 ON employees.empID = assetBooking.empID
                 WHERE assetBooking.status = 'booked'
                 ORDER BY assetBooking.bookingDate DESC";
      }
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows > 0){
        echo "<div class='w3-padding'><table class='w3-table-all'><tr class='w3-theme'><td colspan='2'><b>Employee</b></td><td><b>Asset</b></td><td><b>Status</b></td><td><b>Booking Date</b></td>
        <td><b>Return Date</b></td><td><b>Purpose</b></td><td><b>Other Information</b></td><td></td></tr>";
        while($row2 = $result2->fetch_assoc()){
          ?>
          <tr><td style="width:54px;"><div style="
          border-radius:25px;
          width:50px;
          height:50px;background-position:center;
          background-size:cover;
          background-image:url('http://iss.bfginternational.com/ISS/itemsImages/<?php echo $row2['employeeImage']; ?>')"
          ></div></td>
          <?php
          echo "<td>".$row2['employeeName']."</td>";
          echo "</td><td>".$row2['deviceName']."<br><span class='w3-small'>".$row2['manufacturer']." ".$row2['model']."</span><br>
          <a target='_blank' class='w3-small' href='assetDetails.php?code=".$row2['code']."'>Details</a></td>";
          if($row2['status'] == "booked"){
            echo "<td><span class='w3-tag w3-yellow'>".ucfirst($row2['status'])."</span></td>";
          }else{
            echo "<td><span class='w3-tag w3-green'>".ucfirst($row2['status'])."</span></td>";
          }
          echo "<td>".$row2['bookingDate']."</td>";
          if($row2['returnDate'] >= date('Y-m-d')){
            echo "<td>".$row2['returnDate']."</td>";
          }else{
            echo "<td>".$row2['returnDate'];
            if($row2['status'] == "booked"){
              echo "<span class='w3-tag w3-red w3-small w3-margin-left'>Outdated</span>";
            }
            echo "</td>";
          }
          echo "<td>".$row2['bookingPurpose']."</td><td>".$row2['otherInfo']."</td>
          <td><a style='width:85px;' onclick='showUpdateBookingModal(".$row2['id'].",".$row2['assetID'].")' class='w3-btn w3-border w3-white w3-small'>Update</a><br>
          <a style='margin-top:5px;width:85px;' onclick=showUpdateReturnDateModal(".$row2['id'].",'".$row2['returnDate']."',".$row2['assetID'].") class='w3-btn w3-border w3-white w3-small'>Extend</a></td>
          </tr>";
        }
        echo "</table></div>";
      }else{
        echo "<div class='w3-padding'><h6 style=''>No Booking</h6></div>";
      }
      echo "</div>";
      ?>
      <script>
        function showUpdateBookingModal(x,y){
          document.getElementsByName('bookingID')[0].setAttribute("value",x);
          document.getElementById("assetIDHidden").value = y;
          document.getElementById("updateBookingModal").style.display = "block";
        }
        function showUpdateReturnDateModal(x,y,z){
          document.getElementById("returnDateUpdateDateInput").value = y;
          document.getElementById("returnDateUpdateBookingID").value = x;
          document.getElementById("assetIDHidden2").value = z;
          document.getElementById("updateReturnDateModal").style.display = "block";
        }
      </script>
      <div id="updateBookingModal" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <h2 class="title">Update booking status to <b>recieved</b></h2>
              <form action="updateBooking.php" method="post">
                <input type="hidden" name="bookingID">
                <input type="hidden" name="assetID" id="assetIDHidden">
                <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
                <input class="w3-brown w3-btn w3-margin-top" type="submit" value="Update">
              </form>
            </div>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateBookingModal').style.display='none'">Close</div>
          </div>
        </div>
      </div>

      <div id="updateReturnDateModal" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <h2 class="title">Update booking return date</h2>
              <form action="updateBookingReturnDate.php" method="post">
                <p>
                  <label><b>Extend Date</b></label>
                  <input id="returnDateUpdateDateInput" type="date" class="w3-input w3-border" name="endDate">
                </p>
                <input type="hidden" name="assetID" id="assetIDHidden2">
                <input type="hidden" name="bookingID" id="returnDateUpdateBookingID">
                <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
                <input class="w3-brown w3-btn w3-margin-top" type="submit" value="Extend">
              </form>
            </div>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateReturnDateModal').style.display='none'">Close</div>
          </div>
        </div>
      </div>
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

<gs-form css="text-start">
    <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <input name="email" type="email" class="form-control" placeholder="email" required="">
        <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input name="password" type="password" class="form-control" placeholder="enter password" required="">
    </div>
    <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" name="remember">
        <label class="form-check-label" for="exampleCheck1">Remember me</label>
    </div>
    <!--
        <div class="d-flex justify-content-center">
            <button type="submit" class="btn btn-primary me-1">Submit</button>        
            <button class="btn btn-secondary  ms-1">Cancel</button>
            <button class="btn btn-light ms-1">Reset</button>
        </div>
    -->
    <div class="row m-1">
        <div class="col"></div>
        <div class="col d-flex">
            <gs-button type="submit" color="primary" css="me-1" title="Submit"></gs-button>
            <gs-button type="button" color="secondary" css="ms-1" title="Cancel"></gs-button>
        </div>
        <div class="col d-flex justify-content-end">
            <gs-button type="reset" color="light" css="ms-1" title="Reset"></gs-button>
        </div>
    </div>
</gs-form>

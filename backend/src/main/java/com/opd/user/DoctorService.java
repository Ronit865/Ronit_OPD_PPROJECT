package com.opd.user;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository users;

    @Transactional(readOnly = true)
    public List<UserResponse> listDoctors() {
        return users.findAllByOrderByFullNameAsc().stream().map(UserResponse::from).toList();
    }
}

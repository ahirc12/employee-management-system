package com.learning.employee_management.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestTimingInterceptor implements HandlerInterceptor {

    private static final Logger log =
            LoggerFactory.getLogger(RequestTimingInterceptor.class);

    private static final String START_TIME =
            "requestStartTime";

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {

        request.setAttribute(
                START_TIME,
                System.nanoTime()
        );

        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception) {

        Object startTime = request.getAttribute(START_TIME);

        if (startTime instanceof Long start) {
            double durationMs =
                    (System.nanoTime() - start) / 1_000_000.0;

            log.info(
                    "HTTP {} {} | status={} | duration={} ms",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    String.format("%.3f", durationMs)
            );
        }
    }
}